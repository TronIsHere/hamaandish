"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-orange-500 transition focus:ring-2";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [successPending, setSuccessPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setError(null);
    setSuccessPending(false);
    setPending(true);
    const form = new FormData(formEl);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const referrerUserId = String(form.get("referrerUserId") ?? "");
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const acceptTerms = form.get("acceptTerms") === "on";

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          referrerUserId,
          password,
          confirmPassword,
          acceptTerms,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        pendingApproval?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "ثبت‌نام انجام نشد.");
        return;
      }
      if (data.pendingApproval) {
        setSuccessPending(true);
        formEl.reset();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("ارتباط برقرار نشد. دوباره امتحان کن.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {successPending && (
        <p
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          ثبت‌نام ثبت شد. حساب تا وقتی مدیر تأیید کند غیرفعال است؛ بعداً با همان
          ایمیل و رمز وارد شو.
        </p>
      )}

      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700">
          نام نمایشی
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          placeholder="مثال: ارشیا"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          ایمیل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@example.com"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="referrerUserId"
          className="text-sm font-medium text-zinc-700"
        >
          معرف
        </label>
        <input
          id="referrerUserId"
          name="referrerUserId"
          type="text"
          autoComplete="off"
          required
          maxLength={500}
          placeholder=""
          className={inputClass}
        />
        <p className="text-xs text-zinc-500">
          هر متنی که از طرف معرف برای ثبت‌نام از تو خواسته شده را اینجا بنویس.
          یا خالی بذار
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-700"
          >
            رمز عبور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="حداقل ۸ کاراکتر"
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-zinc-700"
          >
            تکرار رمز عبور
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="تکرار رمز"
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
        <input
          type="checkbox"
          name="acceptTerms"
          required
          className="mt-0.5 accent-orange-500"
        />
        <span>
          با قوانین جامعه و شرایط استفاده موافقم و مسئولیت محتوای منتشرشده را
          می‌پذیرم.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
      >
        {pending ? "در حال ایجاد حساب…" : "ایجاد حساب"}
      </button>

      <p className="mt-6 text-center text-sm text-zinc-600">
        قبلا عضو شدی؟{" "}
        <Link
          href="/login"
          className="font-semibold text-orange-600 hover:text-orange-700"
        >
          وارد شو
        </Link>
      </p>
    </form>
  );
}
