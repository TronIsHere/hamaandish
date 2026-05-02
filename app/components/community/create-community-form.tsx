"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-orange-500 transition focus:ring-2";

export function CreateCommunityForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const slug = String(form.get("slug") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();

    setPending(true);
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; slug?: string };
      if (!res.ok) {
        setError(data.error ?? "مشکلی پیش آمد.");
        return;
      }
      router.push(`/communities/${data.slug}`);
      router.refresh();
    } catch {
      setError("ارتباط برقرار نشد. دوباره امتحان کن.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-700">
          نام انجمن
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={3}
          maxLength={100}
          placeholder="مثال: انجمن هوش مصنوعی"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-zinc-700">
          نامک انگلیسی (آدرس اینترنتی)
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          minLength={3}
          maxLength={50}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="مثال: ai-community"
          className={inputClass}
          dir="ltr"
          onBlur={(e) => {
            e.currentTarget.value = e.currentTarget.value.trim().toLowerCase();
          }}
        />
        <p className="mt-1 text-xs text-zinc-400">
          فقط حروف انگلیسی کوچک، اعداد و خط تیره. این بخش در URL انجمن استفاده می‌شود.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-zinc-700">
          توضیحات انجمن
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={500}
          rows={3}
          placeholder="این انجمن درباره چه موضوعاتی است؟"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-7 outline-none ring-orange-500 transition focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
      >
        {pending ? "در حال ساخت انجمن…" : "ساخت انجمن"}
      </button>
    </form>
  );
}
