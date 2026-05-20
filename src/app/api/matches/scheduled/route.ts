import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matching";
import { logNotification } from "@/lib/notifications";
import { evaluateRules } from "@/lib/workflows";

/**
 * P2: Scheduled Batch Re-Matching
 *
 * POST /api/matches/scheduled
 *
 * Re-runs the matching engine for all OPEN demands against all AVAILABLE
 * candidates. Designed to be called by a cron job (e.g., every 6 hours)
 * or manually from the UI.
 *
 * Differences from /api/matches/batch:
 * - Logs detailed notifications for new strong matches
 * - Evaluates workflow rules for each excellent match
 * - Returns a summary with timing info for monitoring
 */
export async function POST() {
  const startTime = Date.now();

  try {
    const candidates = await prisma.candidate.findMany({ where: { status: "AVAILABLE" } });
    const demands = await prisma.demand.findMany({ where: { status: "OPEN" } });

    const DEFAULT_REQUIRED_EXP = 3;
    let totalMatches = 0;
    let newStrongMatches = 0;
    let hotTalentsUpdated = 0;

    for (const demand of demands) {
      const demandMatches: { candidateName: string; score: number }[] = [];

      for (const candidate of candidates) {
        const { score, reasoning } = calculateMatchScore(
          candidate.extractedSkills,
          demand.requiredSkills,
          candidate.experienceYears,
          DEFAULT_REQUIRED_EXP,
          candidate.expectedCtc || 0,
          demand.rateMin,
          demand.rateMax
        );

        const existing = await prisma.jobCandidateMatch.findUnique({
          where: { demandId_candidateId: { demandId: demand.id, candidateId: candidate.id } },
        });

        const isNew = !existing;
        const isImproved = existing && score > existing.matchScore + 5;

        await prisma.jobCandidateMatch.upsert({
          where: { demandId_candidateId: { demandId: demand.id, candidateId: candidate.id } },
          update: { matchScore: score, matchReason: reasoning },
          create: { demandId: demand.id, candidateId: candidate.id, matchScore: score, matchReason: reasoning },
        });

        totalMatches++;

        if (score >= 75 && (isNew || isImproved)) {
          newStrongMatches++;
          demandMatches.push({ candidateName: candidate.name, score });
        }

        // Evaluate workflow rules for excellent matches
        if (score >= 90) {
          evaluateRules("MATCH_FOUND", {
            id: `${demand.id}-${candidate.id}`,
            matchScore: score,
            demandTitle: demand.title,
            candidateName: candidate.name,
          });
        }
      }

      // If we found new strong matches for this demand, log a summary notification
      if (demandMatches.length > 0) {
        logNotification({
          type: "AUTO_MATCH",
          title: `Re-match: ${demand.title}`,
          message: `${demandMatches.length} new strong matches found during scheduled re-matching.`,
          metadata: { demandId: demand.id, matches: demandMatches.slice(0, 5) },
        });
      }
    }

    // Update hot talent flags
    const hotCandidates = await prisma.jobCandidateMatch.groupBy({
      by: ["candidateId"],
      _count: true,
      _avg: { matchScore: true },
    });

    for (const hc of hotCandidates.filter(h => h._count >= 3 && (h._avg?.matchScore || 0) >= 70)) {
      const candidate = await prisma.candidate.findUnique({ where: { id: hc.candidateId } });
      if (candidate && !candidate.hotTalent) {
        await prisma.candidate.update({ where: { id: hc.candidateId }, data: { hotTalent: true } });
        hotTalentsUpdated++;
      }
    }

    const elapsedMs = Date.now() - startTime;

    logNotification({
      type: "SYSTEM",
      title: "Scheduled Re-Match Complete",
      message: `Processed ${totalMatches} matches across ${demands.length} demands and ${candidates.length} candidates in ${elapsedMs}ms. Found ${newStrongMatches} new strong matches.`,
      metadata: { totalMatches, newStrongMatches, hotTalentsUpdated, elapsedMs },
    });

    return NextResponse.json({
      success: true,
      totalMatches,
      newStrongMatches,
      hotTalentsUpdated,
      demandsProcessed: demands.length,
      candidatesProcessed: candidates.length,
      elapsedMs,
    });
  } catch (error: any) {
    console.error("Scheduled re-match error:", error);
    return NextResponse.json({ error: "Scheduled re-match failed", details: error.message }, { status: 500 });
  }
}
