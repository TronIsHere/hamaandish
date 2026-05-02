"use client";

import { useState } from "react";
import { FaCopy, FaShareFromSquare } from "react-icons/fa6";

type Props = {
  inviteUrl: string;
  communityName: string;
};

export function CommunityInviteLink({ inviteUrl, communityName }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("لینک را کپی کن:", inviteUrl);
    }
  }

  async function shareLink() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: communityName,
        text: `به انجمن «${communityName}» در هم‌اندیش بپیوند`,
        url: inviteUrl,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      await copyLink();
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="break-all rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-700">
        {inviteUrl}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copyLink()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 sm:flex-none"
        >
          <FaCopy className="size-3.5 shrink-0" aria-hidden />
          {copied ? "کپی شد" : "کپی لینک"}
        </button>
        <button
          type="button"
          onClick={() => void shareLink()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50 sm:flex-none"
        >
          <FaShareFromSquare className="size-3.5 shrink-0 text-orange-500" aria-hidden />
          اشتراک‌گذاری
        </button>
      </div>
    </div>
  );
}
