import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";
import { CreateCommunityForm } from "@/app/components/community/create-community-form";
import { getSessionUser } from "@/app/lib/auth/session";

export const metadata = {
  title: "ساخت انجمن جدید | هم‌اندیش",
  description: "یک انجمن تخصصی جدید بساز و جامعه خودت را شکل بده.",
};

export default async function CreateCommunityPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SiteHeader />

      <main className="px-4 py-8">
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8">
              <p className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                ساخت انجمن جدید
              </p>
              <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                انجمن خودت را بساز
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                سازنده انجمن مدیر آن خواهد بود و به‌طور خودکار عضو اول می‌شود.
              </p>
            </div>

            <CreateCommunityForm />
          </section>

          <aside className="rounded-2xl border border-zinc-200 bg-linear-to-b from-orange-500 to-orange-600 p-6 text-white shadow-sm sm:p-8">
            <h2 className="text-xl font-bold">چرا انجمن بسازی؟</h2>
            <p className="mt-3 text-sm text-orange-50">
              با ساخت یک انجمن تخصصی، می‌توانی جامعه‌ای از هم‌فکران دورت جمع
              کنی و بحث‌های هدفمند ایجاد کنی.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="rounded-xl bg-white/15 px-3 py-2">
                تو سازنده و مدیر انجمن هستی
              </li>
              <li className="rounded-xl bg-white/15 px-3 py-2">
                اعضا می‌توانند پست‌های تخصصی منتشر کنند
              </li>
              <li className="rounded-xl bg-white/15 px-3 py-2">
                انجمن در فهرست عمومی هم‌اندیش نمایش داده می‌شود
              </li>
            </ul>
            <Link
              href="/"
              className="mt-8 inline-flex rounded-full border border-white/50 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            >
              بازگشت به صفحه اصلی
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
