import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/session";
import {
  deleteCommunityAndRelated,
  findCommunityBySlug,
} from "@/app/lib/db/communities";

type Params = { slug: string };

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "برای حذف انجمن باید وارد حساب کاربری شوی." },
      { status: 401 },
    );
  }

  const { slug } = await params;
  const community = await findCommunityBySlug(slug);
  if (!community) {
    return NextResponse.json({ error: "انجمن پیدا نشد." }, { status: 404 });
  }

  if (community.ownerUserId !== user.id) {
    return NextResponse.json(
      { error: "فقط سازنده انجمن می‌تواند آن را حذف کند." },
      { status: 403 },
    );
  }

  const ok = await deleteCommunityAndRelated(slug);
  if (!ok) {
    return NextResponse.json(
      { error: "مشکلی پیش آمد. دوباره امتحان کن." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
