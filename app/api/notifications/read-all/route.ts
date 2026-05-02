import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/session";
import { markAllRead } from "@/app/lib/db/notifications";

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "وارد حساب کاربری نشدی." }, { status: 401 });
  }

  try {
    await markAllRead(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "مشکلی پیش آمد." }, { status: 500 });
  }
}
