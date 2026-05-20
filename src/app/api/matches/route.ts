import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matching";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, demandId } = body;

    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    const demand = await prisma.demand.findUnique({ where: { id: demandId } });

    if (!candidate || !demand) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const requiredExp = 5;
    const { score, reasoning } = calculateMatchScore(
      candidate.extractedSkills,
      demand.requiredSkills,
      candidate.experienceYears,
      requiredExp,
      candidate.expectedCtc || 0,
      demand.rateMin,
      demand.rateMax
    );

    const match = await prisma.jobCandidateMatch.upsert({
      where: {
        demandId_candidateId: { demandId, candidateId },
      },
      update: { matchScore: score, matchReason: reasoning },
      create: {
        demandId,
        candidateId,
        matchScore: score,
        matchReason: reasoning,
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}