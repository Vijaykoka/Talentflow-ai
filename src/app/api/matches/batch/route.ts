import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matching";

export async function POST() {
  try {
    const candidates = await prisma.candidate.findMany({ where: { status: "AVAILABLE" } });
    const demands = await prisma.demand.findMany({ where: { status: "OPEN" } });

    const DEFAULT_REQUIRED_EXP = 3; // Fallback since Demand model lacks requiredExp field
    const matches = [];

    for (const candidate of candidates) {
      for (const demand of demands) {
        const { score, reasoning } = calculateMatchScore(
          candidate.extractedSkills,
          demand.requiredSkills,
          candidate.experienceYears,
          DEFAULT_REQUIRED_EXP,
          candidate.expectedCtc || 0,
          demand.rateMin,
          demand.rateMax
        );

        const match = await prisma.jobCandidateMatch.upsert({
          where: {
            demandId_candidateId: { demandId: demand.id, candidateId: candidate.id },
          },
          update: { matchScore: score, matchReason: reasoning },
          create: {
            demandId: demand.id,
            candidateId: candidate.id,
            matchScore: score,
            matchReason: reasoning,
          },
        });
        matches.push(match);
      }
    }

    const hotCandidates = await prisma.jobCandidateMatch.groupBy({
      by: ["candidateId"],
      _count: true,
      _avg: { matchScore: true },
    });

    const qualifiedHotCandidates = hotCandidates.filter(
      hc => hc._count >= 3 && (hc._avg?.matchScore || 0) >= 70
    );

    for (const hc of qualifiedHotCandidates) {
      await prisma.candidate.update({
        where: { id: hc.candidateId },
        data: { hotTalent: true },
      });
    }

    return NextResponse.json({ matchesCreated: matches.length, hotTalentsUpdated: qualifiedHotCandidates.length });
  } catch (error: any) {
    console.error("Batch match error:", error);
    return NextResponse.json({ error: "Failed to batch match", details: error.message }, { status: 500 });
  }
}