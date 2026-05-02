import { NextResponse } from "next/server";
import { createSessionToken } from "@/app/lib/auth/session";
import { verifyPassword } from "@/app/lib/auth/password";
import { findUserByEmail } from "@/app/lib/auth/users";
import { validateEmail } from "@/app/lib/auth/validate";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/app/lib/auth/config";

type Body = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const emailErr = validateEmail(body.email ?? "");
  if (emailErr) {
    return NextResponse.json({ error: emailErr }, { status: 400 });
  }

  const password = body.password ?? "";
  if (!password) {
    return NextResponse.json({ error: "رمز عبور را وارد کن." }, { status: 400 });
  }

  let user;
  try {
    user = await findUserByEmail(body.email ?? "");
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "الان نمی‌توانیم وارد شویم. بعداً دوباره امتحان کن." },
      { status: 503 },
    );
  }
  if (!user) {
    return NextResponse.json(
      { error: "ایمیل یا رمز عبور درست نیست." },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "ایمیل یا رمز عبور درست نیست." },
      { status: 401 },
    );
  }

  if (user.accountStatus === "pending") {
    return NextResponse.json(
      {
        error:
          "حساب تو هنوز توسط مدیر تأیید نشده. بعداً دوباره وارد شو یا با پشتیبانی تماس بگیر.",
      },
      { status: 403 },
    );
  }

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return res;
}
