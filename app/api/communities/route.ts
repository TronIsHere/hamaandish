import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/session";
import {
  createCommunity,
  findCommunityBySlug,
  isValidCommunitySlug,
  normalizeLatinSlug,
} from "@/app/lib/db/communities";
import { joinCommunity } from "@/app/lib/db/memberships";

type Body = {
  name?: string;
  description?: string;
  icon?: string;
  slug?: string;
};

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "برای ساخت انجمن باید وارد حساب کاربری شوی." },
      { status: 401 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (name.length < 3) {
    return NextResponse.json(
      { error: "نام انجمن باید حداقل ۳ کاراکتر باشد." },
      { status: 400 },
    );
  }
  if (name.length > 100) {
    return NextResponse.json(
      { error: "نام انجمن خیلی بلند است." },
      { status: 400 },
    );
  }

  const description = (body.description ?? "").trim();
  if (description.length < 10) {
    return NextResponse.json(
      { error: "توضیحات انجمن باید حداقل ۱۰ کاراکتر باشد." },
      { status: 400 },
    );
  }

  const icon = (body.icon ?? "💬").trim() || "💬";
  const slug = normalizeLatinSlug(body.slug ?? "");

  if (!isValidCommunitySlug(slug)) {
    return NextResponse.json(
      {
        error:
          "نامک انگلیسی نامعتبر است. فقط حروف انگلیسی کوچک، اعداد و خط تیره بگذار (۳ تا ۵۰ کاراکتر).",
      },
      { status: 400 },
    );
  }

  const existing = await findCommunityBySlug(slug);
  if (existing) {
    return NextResponse.json(
      { error: "انجمنی با این نام قبلاً ساخته شده است." },
      { status: 409 },
    );
  }

  try {
    const community = await createCommunity({
      slug,
      name,
      description,
      icon,
      ownerUserId: user.id,
    });

    await joinCommunity(user.id, slug);

    return NextResponse.json(
      { ok: true, slug: community.slug },
      { status: 201 },
    );
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "انجمنی با این نام قبلاً ساخته شده است." },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "مشکلی پیش آمد. دوباره امتحان کن." },
      { status: 500 },
    );
  }
}
