import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { resumes: true, matches: { include: { demand: true } } },
    });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(candidate);
  }

  return NextResponse.json({ error: "ID required" }, { status: 400 });
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const body = await request.json();
    const candidate = await prisma.candidate.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(candidate);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.candidate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}