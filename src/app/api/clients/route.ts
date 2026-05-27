import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: { select: { demands: true, hires: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Clients GET error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contact, email, industry } = body;

    const client = await prisma.client.create({
      data: {
        name,
        contact,
        email,
        industry: industry || "Technology",
      },
    });

    logNotification({
      type: "SYSTEM",
      title: `Client Onboarded: ${client.name}`,
      message: `New client account ${client.name} has been successfully registered.`,
      metadata: { clientId: client.id },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Clients POST error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to create client" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, contact, email, industry } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (contact !== undefined) updateData.contact = contact;
    if (email !== undefined) updateData.email = email;
    if (industry !== undefined) updateData.industry = industry;

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Clients PATCH error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clients DELETE error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to delete client" }, { status: 500 });
  }
}
