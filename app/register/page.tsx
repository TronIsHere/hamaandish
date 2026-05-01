import Link from "next/link";
import { RegisterForm } from "@/app/components/auth/register-form";
import { SiteHeader } from "@/app/components/site-header";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SiteHeader />
      <main className="px-4 py-8">
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_1.1fr]">
          <aside className="order-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:order-1">
            <h2 className="text-xl font-bold">چرا عضویت در هم‌اندیش؟</h2>
            <p className="mt-3 text-sm text-zinc-600">
              با ساخت حساب می‌تونی بحث‌های دلخواهت را دنبال کنی، پست منتشر کنی و شبکه
              حرفه‌ای خودت را بسازی.
            </p>
            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-sm font-semibold">ساخت پروفایل تخصصی</p>
                <p className="mt-1 text-xs text-zinc-600">
                  مهارت‌ها و تجربه‌ات را به جامعه معرفی کن.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-sm font-semibold">دنبال کردن انجمن‌ها</p>
                <p className="mt-1 text-xs text-zinc-600">
                  فقط موضوعات مورد علاقه‌ات را ببین.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-sm font-semibold">تعامل با پست‌ها</p>
                <p className="mt-1 text-xs text-zinc-600">
                  رای بده، نظر بده و گفت‌وگو را پیش ببر.
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="mt-8 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              ← بازگشت به صفحه اصلی
            </Link>
          </aside>

          <section className="order-1 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:order-2">
            <div className="mb-8">
              <p className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                ثبت‌نام در هم‌اندیش
              </p>
              <h1 className="mt-4 text-2xl font-bold sm:text-3xl">حساب جدید بساز</h1>
              <p className="mt-2 text-sm text-zinc-600">
                فقط چند قدم تا شروع حضور در جامعه فارسی فاصله داری.
              </p>
            </div>

            <RegisterForm />
          </section>
        </div>
      </main>
    </div>
  );
}
