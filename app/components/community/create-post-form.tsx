"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { TiptapEditor } from "@/app/components/editor/tiptap-editor";

type Props = {
  communitySlug: string;
  communityName: string;
};

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none ring-orange-500 transition focus:ring-2";

export function CreatePostForm({ communitySlug, communityName }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const title = titleRef.current?.value ?? "";

    if (body.replace(/<[^>]*>/g, "").trim().length < 10) {
      setError("متن پست باید حداقل ۱۰ کاراکتر داشته باشد.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`/api/communities/${communitySlug}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; id?: string };
      if (!res.ok) {
        setError(data.error ?? "مشکلی پیش آمد.");
        return;
      }
      if (titleRef.current) titleRef.current.value = "";
      setBody("");
      router.push(`/posts/${data.id}`);
      router.refresh();
    } catch {
      setError("ارتباط برقرار نشد. دوباره امتحان کن.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <h2 className="text-sm font-semibold text-zinc-800">
        ایجاد پست در {communityName}
      </h2>

      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          عنوان پست
        </label>
        <input
          ref={titleRef}
          type="text"
          required
          minLength={5}
          maxLength={300}
          placeholder="یک عنوان دقیق و واضح بنویس..."
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          متن پست
        </label>
        <TiptapEditor value={body} onChange={setBody} />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          {pending ? "در حال انتشار…" : "انتشار در انجمن"}
        </button>
      </div>
    </form>
  );
}
