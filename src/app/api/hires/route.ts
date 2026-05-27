import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateMarginForecast } from "@/lib/matching";
import { evaluateRules } from "@/lib/workflows";

export async function GET() {
  try {
    const hires = await prisma.hire.findMany({
      include: {
        demand: true,
        candidate: true,
        client: true,
        vendor: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(hires);
  } catch (error) {
    console.error("Hires GET error:", error);
    return NextResponse.json({ error: "Failed to fetch hires" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Creating hire with body:", body);
    const { demandId, candidateId, clientId, vendorId, hiredRate, hiringCost, startDate } = body;

    const forecast = calculateMarginForecast(hiredRate, hiredRate * 0.7, hiringCost || 0, true);

    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      return NextResponse.json({ error: "Invalid start date format" }, { status: 400 });
    }

    const hire = await prisma.hire.create({
      data: {
        demandId,
        candidateId,
        clientId: clientId || null,
        vendorId: vendorId || null,
        hiredRate,
        hiringCost: hiringCost || 0,
        startDate: startDateObj,
        projectedMargin12m: forecast.projectedMargin12m,
      },
      include: {
        demand: true,
        candidate: true,
        client: true,
        vendor: true,
      },
    });

    await prisma.demand.update({
      where: { id: demandId },
      data: { status: "FILLED" },
    });

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "HIRED" },
    });

    // P2: Evaluate workflow rules on hire creation
    evaluateRules("HIRE_CREATED", {
      id: hire.id,
      candidateName: hire.candidate?.name,
      demandTitle: hire.demand?.title,
      hiredRate,
      projectedMargin12m: forecast.projectedMargin12m,
    });

    return NextResponse.json(hire, { status: 201 });
  } catch (error: any) {
    console.error("Hires POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create hire" }, { status: 500 });
  }
}