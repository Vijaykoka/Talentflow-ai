import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const demand = await prisma.demand.findUnique({
      where: { id },
      include: { vendor: true, matches: { include: { candidate: true }, orderBy: { matchScore: "desc" } } },
    });
    if (!demand) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(demand);
  }

  return NextResponse.json({ error: "ID required" }, { status: 400 });
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const body = await request.json();
    const demand = await prisma.demand.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(demand);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.demand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}