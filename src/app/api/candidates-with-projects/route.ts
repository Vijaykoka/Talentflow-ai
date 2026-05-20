import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const candidatesWithProjects = await prisma.candidate.findMany({
      include: {
        hires: {
          include: {
            demand: true,
            vendor: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(candidatesWithProjects);
  } catch (error: any) {
    console.error("Candidates with projects GET error:", error);
    return NextResponse.json({ error: "Failed to fetch candidates with projects" }, { status: 500 });
  }
}