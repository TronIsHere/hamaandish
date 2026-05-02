import Link from "next/link";
import { FaComments, FaUserClock } from "react-icons/fa6";
import { listPendingRegistrations } from "@/app/lib/auth/users";

export default async function AdminDashboardPage() {
  let pendingCount = 0;
  try {
    const pending = await listPendingRegistrations();
    pendingCount = pending.length;
  } catch {
    pendingCount = 0;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">پنل مدیریت</h1>
        <p className="mt-2 text-sm text-zinc-600">
          تأیید عضویت، حذف پست از اینجا یا از خود فید (وقتی وارد حساب سوپراَدمین
          شده‌ای، دکمهٔ حذف روی هر کارت است).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/registrations"
          className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow-md"
        >
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <FaUserClock className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-bold text-zinc-900">
              اعضای در انتظار تأیید
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              پذیرش یا رد درخواست ثبت‌نام
            </p>
          </div>
          <p className="text-sm font-semibold text-orange-600">
            در صف: {pendingCount}
            <span className="mr-2 text-xs font-normal text-zinc-400 transition group-hover:text-orange-700">
              برو به صف ←
            </span>
          </p>
        </Link>

        <Link
          href="/admin/posts"
          className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow-md"
        >
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <FaComments className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-bold text-zinc-900">نسخهٔ فید برای مدیر</h2>
            <p className="mt-1 text-sm text-zinc-600">
              مرور تمام پست‌ها و حذف محتوای نامناسب
            </p>
          </div>
          <span className="text-xs font-medium text-zinc-400 transition group-hover:text-orange-600">
            باز کردن نسخهٔ فید مرور مدیر ←
          </span>
        </Link>
      </div>

      <Link
        href="/"
        className="mt-10 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700"
      >
        ← بازگشت به خانه و فید
      </Link>
    </main>
  );
}
