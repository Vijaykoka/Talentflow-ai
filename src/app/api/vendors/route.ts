import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: { select: { demands: true, hires: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(vendors);
  } catch (error) {
    console.error("Vendors GET error:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contact, email, commissionRate } = body;

    const vendor = await prisma.vendor.create({
      data: {
        name,
        contact,
        email,
        commissionRate: commissionRate || 0.1,
      },
    });

    logNotification({
      type: "VENDOR",
      title: `Vendor Added: ${vendor.name}`,
      message: `New vendor ${vendor.name} registered with ${((commissionRate || 0.1) * 100).toFixed(0)}% commission rate.`,
      metadata: { vendorId: vendor.id },
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error("Vendors POST error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to create vendor" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, portalAccess, performanceScore, commissionRate } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (performanceScore !== undefined) updateData.performanceScore = performanceScore;
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updateData,
    });

    // Portal access management (in-memory flag since we don't have a DB field)
    if (portalAccess !== undefined) {
      logNotification({
        type: "VENDOR",
        title: `Portal Access ${portalAccess ? "Granted" : "Revoked"}`,
        message: `Portal access ${portalAccess ? "enabled" : "disabled"} for vendor ${vendor.name}.`,
        emailTo: vendor.email || undefined,
        metadata: { vendorId: vendor.id, portalAccess },
      });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error("Vendors PATCH error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to update vendor" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.vendor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vendors DELETE error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to delete vendor" }, { status: 500 });
  }
}