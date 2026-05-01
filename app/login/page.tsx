import Link from "next/link";
import { FaHandPaper } from "react-icons/fa";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <p className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              ورود به هم‌اندیش
            </p>
            <h1 className="mt-4 inline-flex items-center gap-2 text-2xl font-bold sm:text-3xl">
              خوش برگشتی
              <FaHandPaper aria-hidden className="size-5 text-orange-500" />
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              برای ادامه گفت‌وگو و مدیریت پست‌ها، وارد حساب کاربری خودت شو.
            </p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                ایمیل
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-orange-500 transition focus:ring-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                  رمز عبور
                </label>
                <Link href="#" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                  فراموشی رمز؟
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-orange-500 transition focus:ring-2"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              ورود به حساب
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            حساب نداری؟{" "}
            <Link href="/register" className="font-semibold text-orange-600 hover:text-orange-700">
              ثبت‌نام کن
            </Link>
          </p>
        </section>

        <aside className="rounded-2xl border border-zinc-200 bg-linear-to-b from-orange-500 to-orange-600 p-6 text-white shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">در جریان بحث‌های تخصصی فارسی باش</h2>
          <p className="mt-3 text-sm text-orange-50">
            جدیدترین گفت‌وگوهای طراحی محصول، توسعه وب، بازاریابی و استارتاپ‌ها را یک‌جا
            دنبال کن.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="rounded-xl bg-white/15 px-3 py-2">پاسخ سریع به سوال‌های فنی</li>
            <li className="rounded-xl bg-white/15 px-3 py-2">شبکه‌سازی با افراد هم‌مسیر</li>
            <li className="rounded-xl bg-white/15 px-3 py-2">دسترسی به ترندهای هفتگی جامعه</li>
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
  );
}
