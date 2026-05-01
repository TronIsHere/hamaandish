import { NextResponse } from "next/server";
import { createSessionToken } from "@/app/lib/auth/session";
import { hashPassword } from "@/app/lib/auth/password";
import { createUser } from "@/app/lib/auth/users";
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
} from "@/app/lib/auth/validate";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/app/lib/auth/config";

type Body = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const nameErr = validateDisplayName(body.name ?? "");
  if (nameErr) {
    return NextResponse.json({ error: nameErr }, { status: 400 });
  }

  const emailErr = validateEmail(body.email ?? "");
  if (emailErr) {
    return NextResponse.json({ error: emailErr }, { status: 400 });
  }

  const passErr = validatePassword(body.password ?? "");
  if (passErr) {
    return NextResponse.json({ error: passErr }, { status: 400 });
  }

  if (body.password !== body.confirmPassword) {
    return NextResponse.json(
      { error: "رمز و تکرار رمز یکسان نیستند." },
      { status: 400 },
    );
  }

  if (!body.acceptTerms) {
    return NextResponse.json(
      { error: "باید با قوانین جامعه موافقت کنی." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(body.password!);

  try {
    const row = await createUser({
      email: body.email!,
      name: body.name!.trim(),
      passwordHash,
    });

    const token = await createSessionToken({
      id: row.id,
      email: row.email,
      name: row.name,
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
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً ثبت شده است." },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "مشکلی پیش آمد. بعداً دوباره امتحان کن." },
      { status: 500 },
    );
  }
}
