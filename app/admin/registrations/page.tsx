import Link from "next/link";
import { listPendingRegistrations } from "@/app/lib/auth/users";
import { AdminApproveButtons } from "./approve-buttons";

export default async function AdminRegistrationsPage() {
  let rows: Awaited<ReturnType<typeof listPendingRegistrations>> = [];
  try {
    rows = await listPendingRegistrations();
  } catch {
    rows = [];
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
          سوپراَدمین
        </p>
        <h1 className="mt-2 text-2xl font-bold">ثبت‌نام‌های در انتظار تصمیم</h1>
        <p className="mt-2 text-sm text-zinc-600">
          با <strong className="font-semibold text-zinc-800">پذیرش و عضویت</strong>{" "}
          کاربر می‌تواند وارد شود؛ با{" "}
          <strong className="font-semibold text-zinc-800">رد درخواست</strong> ثبت‌نام
          حذف می‌شود و فرد عضو نمی‌شود. سوپراَدمین با ایمیل‌های{" "}
          <code className="rounded bg-zinc-200 px-1 text-xs">ADMIN_EMAILS</code>
          تنظیم می‌شود.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          هیچ درخواست عضویت جدیدی در صف نیست.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-zinc-900">{r.name}</p>
                <p className="truncate text-zinc-600">{r.email}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  ایدی معرف:{" "}
                  <span className="font-mono">{r.referrerUserIdHex ?? "—"}</span>
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  درخواست: {r.createdAt.toLocaleString("fa-IR")}
                </p>
              </div>
              <AdminApproveButtons userId={r.id} />
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/admin"
        className="mt-8 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
      >
        ← داشبورد مدیر
      </Link>
    </main>
  );
}
