import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const matches = await prisma.jobCandidateMatch.findMany({
      where: {
        demand: {
          vendorId: {
            not: null,
          },
        },
      },
      include: {
        candidate: true,
        demand: {
          include: {
            vendor: true,
          },
        },
        feedback: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(matches);
  } catch (error: any) {
    console.error("Feedback GET error:", error);
    return NextResponse.json({ error: "Failed to fetch vendor candidates and feedbacks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      matchId,
      rating,
      interviewer,
      technicalScore,
      behavioralScore,
      comments,
      recommendation,
    } = body;

    if (!matchId || rating === undefined || !interviewer || technicalScore === undefined || behavioralScore === undefined || !comments || !recommendation) {
      return NextResponse.json({ error: "All feedback fields are required" }, { status: 400 });
    }

    const matchExists = await prisma.jobCandidateMatch.findUnique({
      where: { id: matchId },
    });

    if (!matchExists) {
      return NextResponse.json({ error: "Candidate match not found" }, { status: 404 });
    }

    // Create or update (upsert) the feedback
    const feedback = await prisma.interviewFeedback.upsert({
      where: { matchId },
      update: {
        rating: parseInt(rating),
        interviewer,
        technicalScore: parseInt(technicalScore),
        behavioralScore: parseInt(behavioralScore),
        comments,
        recommendation,
      },
      create: {
        matchId,
        rating: parseInt(rating),
        interviewer,
        technicalScore: parseInt(technicalScore),
        behavioralScore: parseInt(behavioralScore),
        comments,
        recommendation,
      },
    });

    // Automatically transition the candidate match status based on the recommendation
    let matchStatus = "PENDING";
    if (recommendation === "STRONG_HIRE" || recommendation === "HIRE") {
      matchStatus = "SHORTLISTED";
    } else if (recommendation === "NO_HIRE" || recommendation === "STRONG_NO_HIRE") {
      matchStatus = "REJECTED";
    }

    await prisma.jobCandidateMatch.update({
      where: { id: matchId },
      data: { status: matchStatus },
    });

    // Also update candidate status accordingly
    let candidateStatus = "INTERVIEWING";
    if (recommendation === "STRONG_HIRE" || recommendation === "HIRE") {
      candidateStatus = "OFFERED";
    } else if (recommendation === "NO_HIRE" || recommendation === "STRONG_NO_HIRE") {
      candidateStatus = "AVAILABLE"; // Put back in available pool
    }

    await prisma.candidate.update({
      where: { id: matchExists.candidateId },
      data: { status: candidateStatus },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error: any) {
    console.error("Feedback POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit interview feedback" }, { status: 500 });
  }
}
