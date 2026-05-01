import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/session";
import {
  findCommunityBySlug,
  incrementMemberCount,
} from "@/app/lib/db/communities";
import {
  isMember,
  joinCommunity,
  leaveCommunity,
} from "@/app/lib/db/memberships";

type Params = { slug: string };

export async function POST(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "برای عضویت باید وارد حساب کاربری شوی." },
      { status: 401 },
    );
  }

  const { slug } = await params;
  const community = await findCommunityBySlug(slug);
  if (!community) {
    return NextResponse.json({ error: "انجمن پیدا نشد." }, { status: 404 });
  }

  const already = await isMember(user.id, slug);
  if (already) {
    return NextResponse.json({ ok: true, joined: true });
  }

  await joinCommunity(user.id, slug);
  await incrementMemberCount(slug, 1);
  return NextResponse.json({ ok: true, joined: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "وارد حساب کاربری شو." },
      { status: 401 },
    );
  }

  const { slug } = await params;
  const community = await findCommunityBySlug(slug);
  if (!community) {
    return NextResponse.json({ error: "انجمن پیدا نشد." }, { status: 404 });
  }

  if (community.ownerUserId === user.id) {
    return NextResponse.json(
      { error: "سازنده انجمن نمی‌تواند از آن خارج شود." },
      { status: 400 },
    );
  }

  const memberStatus = await isMember(user.id, slug);
  if (!memberStatus) {
    return NextResponse.json({ ok: true, joined: false });
  }

  await leaveCommunity(user.id, slug);
  await incrementMemberCount(slug, -1);
  return NextResponse.json({ ok: true, joined: false });
}
