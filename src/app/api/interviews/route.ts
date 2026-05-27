import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const interviews = await prisma.interview.findMany({
      include: {
        match: {
          include: {
            candidate: true,
            demand: {
              include: {
                client: true,
                vendor: true,
              }
            }
          }
        }
      },
      orderBy: {
        scheduledAt: "asc",
      }
    });
    return NextResponse.json(interviews);
  } catch (error: any) {
    console.error("Interviews GET error:", error);
    return NextResponse.json({ error: "Failed to fetch scheduled interviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, scheduledAt, panelName, panelEmails, meetingLink } = body;

    if (!matchId || !scheduledAt || !panelName) {
      return NextResponse.json({ error: "Candidate Match, Schedule Date/Time, and Panel Name are required" }, { status: 400 });
    }

    const matchExists = await prisma.jobCandidateMatch.findUnique({
      where: { id: matchId },
      include: {
        candidate: true,
        demand: {
          include: {
            client: true,
            vendor: true,
          }
        }
      }
    });

    if (!matchExists) {
      return NextResponse.json({ error: "JobCandidateMatch not found" }, { status: 404 });
    }

    const interview = await prisma.interview.create({
      data: {
        matchId,
        scheduledAt: new Date(scheduledAt),
        panelName,
        panelEmails: panelEmails || null,
        meetingLink: meetingLink || null,
        status: "SCHEDULED",
      }
    });

    // Update match status to INTERVIEW
    await prisma.jobCandidateMatch.update({
      where: { id: matchId },
      data: { status: "INTERVIEW" }
    });

    // Update candidate status to INTERVIEWING
    await prisma.candidate.update({
      where: { id: matchExists.candidateId },
      data: { status: "INTERVIEWING" }
    });

    // Log notification & send email stub to panel members
    logNotification({
      type: "SYSTEM",
      title: `Interview Scheduled: ${matchExists.candidate.name}`,
      message: `Technical Interview scheduled with ${panelName} on ${new Date(scheduledAt).toLocaleString()}. Video link: ${meetingLink || "N/A"}`,
      metadata: { interviewId: interview.id, matchId },
      emailTo: panelEmails || undefined,
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (error: any) {
    console.error("Interviews POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to schedule interview" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, scheduledAt, panelName, panelEmails, meetingLink, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
    if (panelName !== undefined) updateData.panelName = panelName;
    if (panelEmails !== undefined) updateData.panelEmails = panelEmails;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (status !== undefined) updateData.status = status;

    const interview = await prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        match: {
          include: {
            candidate: true,
          }
        }
      }
    });

    if (status === "CANCELLED") {
      // Put candidate back to AVAILABLE and match back to PENDING if cancelled
      await prisma.jobCandidateMatch.update({
        where: { id: interview.matchId },
        data: { status: "PENDING" }
      });
      await prisma.candidate.update({
        where: { id: interview.match.candidateId },
        data: { status: "AVAILABLE" }
      });

      logNotification({
        type: "SYSTEM",
        title: `Interview Cancelled: ${interview.match.candidate.name}`,
        message: `The interview scheduled with ${interview.panelName} has been cancelled.`,
        metadata: { interviewId: interview.id }
      });
    }

    return NextResponse.json(interview);
  } catch (error: any) {
    console.error("Interviews PATCH error:", error);
    return NextResponse.json({ error: error.message || "Failed to update interview" }, { status: 500 });
  }
}
