import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/session";
import {
  getNotificationsForUser,
  getUnreadCount,
} from "@/app/lib/db/notifications";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "وارد حساب کاربری نشدی." }, { status: 401 });
  }

  try {
    const [notifications, unreadCount] = await Promise.all([
      getNotificationsForUser(user.id),
      getUnreadCount(user.id),
    ]);
    return NextResponse.json({ ok: true, notifications, unreadCount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "مشکلی پیش آمد." }, { status: 500 });
  }
}
