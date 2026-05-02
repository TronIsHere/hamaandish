import { NextResponse } from "next/server";
import { getAdminSession } from "@/app/lib/auth/admin";
import { approveUserById } from "@/app/lib/auth/users";

type Params = { userId: string };

export async function POST(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const user = await getAdminSession();
  if (!user) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 403 });
  }

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "شناسه نامعتبر است." }, { status: 400 });
  }

  try {
    const ok = await approveUserById(userId);
    if (!ok) {
      return NextResponse.json(
        { error: "این کاربر در انتظار تأیید نیست یا وجود ندارد." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
