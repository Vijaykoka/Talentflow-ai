import { NextResponse } from "next/server";
import { getRules, toggleRule, resetRules } from "@/lib/workflows";

export async function GET() {
  try {
    const rules = getRules();
    return NextResponse.json({ rules });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, reset } = body;

    if (reset) {
      resetRules();
      return NextResponse.json({ success: true, message: "Rules reset to defaults" });
    }

    if (id) {
      const rule = toggleRule(id);
      if (rule) {
        return NextResponse.json({ success: true, rule });
      }
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Provide 'id' to toggle or 'reset' to restore defaults" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}
