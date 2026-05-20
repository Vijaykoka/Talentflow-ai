import { NextResponse } from "next/server";
import { getNotifications, markRead, markAllRead, getUnreadCount } from "@/lib/notifications";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    const notifications = getNotifications({ unreadOnly, limit });
    const unreadCount = getUnreadCount();

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, markAll } = body;

    if (markAll) {
      const count = markAllRead();
      return NextResponse.json({ success: true, markedRead: count });
    }

    if (id) {
      const success = markRead(id);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: "Provide 'id' or 'markAll'" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
