import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matching";
import { logNotification } from "@/lib/notifications";
import { evaluateRules } from "@/lib/workflows";

export async function GET() {
  try {
    const demands = await prisma.demand.findMany({
      include: {
        vendor: true,
        _count: { select: { matches: true, hires: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(demands);
  } catch (error: any) {
    console.error("Demands GET error:", error);
    return NextResponse.json({ error: "Failed to fetch demands" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, jdText, requiredSkills, rateMin, rateMax, location, priority, vendorId } = body;

    const demand = await prisma.demand.create({
      data: {
        title,
        jdText,
        requiredSkills,
        rateMin,
        rateMax,
        location,
        priority: priority || "MEDIUM",
        vendorId,
      },
    });

    // P2: Auto-match on demand creation
    try {
      const candidates = await prisma.candidate.findMany({ where: { status: "AVAILABLE" } });
      const DEFAULT_REQUIRED_EXP = 3;
      let matchCount = 0;
      const topMatches: { name: string; score: number }[] = [];

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

        await prisma.jobCandidateMatch.upsert({
          where: { demandId_candidateId: { demandId: demand.id, candidateId: candidate.id } },
          update: { matchScore: score, matchReason: reasoning },
          create: { demandId: demand.id, candidateId: candidate.id, matchScore: score, matchReason: reasoning },
        });
        matchCount++;

        if (score >= 75) {
          topMatches.push({ name: candidate.name, score });
        }
      }

      // Log notification for the auto-match
      logNotification({
        type: "AUTO_MATCH",
        title: `Auto-matched "${demand.title}"`,
        message: `Found ${matchCount} matches, ${topMatches.length} strong fits.`,
        metadata: { demandId: demand.id, matchCount, topMatches: topMatches.slice(0, 5) },
      });

      return NextResponse.json({ ...demand, _autoMatch: { matchCount, strongFits: topMatches.length } }, { status: 201 });
    } catch (matchErr) {
      console.warn("Auto-match failed (non-blocking):", matchErr);
      return NextResponse.json(demand, { status: 201 });
    }
  } catch (error: any) {
    console.error("Demands POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create demand" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.demand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Demands DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete demand" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const demand = await prisma.demand.update({
      where: { id },
      data: { status },
    });

    // P2: Evaluate workflow rules on status change
    evaluateRules("DEMAND_STATUS_CHANGED", { id, status, title: demand.title, priority: demand.priority });

    return NextResponse.json(demand);
  } catch (error: any) {
    console.error("Demands PATCH error:", error);
    return NextResponse.json({ error: error.message || "Failed to update demand" }, { status: 500 });
  }
}