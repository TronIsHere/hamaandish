"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-orange-500 transition focus:ring-2";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "ورود انجام نشد.");
        return;
      }

      let nextPath = "/";
      const rawNext = searchParams.get("next");
      if (
        rawNext &&
        rawNext.startsWith("/") &&
        !rawNext.startsWith("//") &&
        !rawNext.includes("\0")
      ) {
        nextPath = rawNext;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("ارتباط برقرار نشد. دوباره امتحان کن.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

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
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-zinc-700">
            رمز عبور
          </label>
          <span className="text-xs font-semibold text-zinc-400">
            فراموشی رمز؟ (به‌زودی)
          </span>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
      >
        {pending ? "در حال ورود…" : "ورود به حساب"}
      </button>

      <p className="mt-6 text-center text-sm text-zinc-600">
        حساب نداری؟{" "}
        <Link href="/register" className="font-semibold text-orange-600 hover:text-orange-700">
          ثبت‌نام کن
        </Link>
      </p>
    </form>
  );
}
