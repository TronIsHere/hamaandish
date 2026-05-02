import { NextResponse } from "next/server";
import { getAdminSession } from "@/app/lib/auth/admin";
import { softDeleteCommentByAdmin } from "@/app/lib/db/comments";

type Params = { commentId: string };

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 403 });
  }

  const { commentId } = await params;
  if (!commentId) {
    return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 });
  }

  try {
    const ok = await softDeleteCommentByAdmin(commentId);
    if (!ok) {
      return NextResponse.json({ error: "دیدگاه پیدا نشد." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
