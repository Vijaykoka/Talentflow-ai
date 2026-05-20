import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        resumes: true,
        _count: { select: { matches: true, hires: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(candidates);
  } catch (error: any) {
    console.error("Candidates GET error:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, resumeUrl, extractedSkills, experienceYears, currentCtc, expectedCtc, status } = body;

    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        phone,
        resumeUrl,
        extractedSkills: extractedSkills || [],
        experienceYears: experienceYears || 0,
        currentCtc,
        expectedCtc,
        status: status || "AVAILABLE",
      },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error: any) {
    console.error("Candidates POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create candidate" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.candidate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Candidates DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete candidate" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, hotTalent } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const candidate = await prisma.candidate.update({
      where: { id },
      data: { status, hotTalent },
    });
    return NextResponse.json(candidate);
  } catch (error: any) {
    console.error("Candidates PATCH error:", error);
    return NextResponse.json({ error: error.message || "Failed to update candidate" }, { status: 500 });
  }
}