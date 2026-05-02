import { NextResponse } from "next/server";
import { deletePostById } from "@/app/lib/db/posts";
import { getAdminSession } from "@/app/lib/auth/admin";

type Params = { postId: string };

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 403 });
  }

  const { postId } = await params;
  if (!postId) {
    return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 });
  }

  try {
    const ok = await deletePostById(postId);
    if (!ok) {
      return NextResponse.json({ error: "پست یافت نشد." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
