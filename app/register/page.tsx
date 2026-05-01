import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_1.1fr]">
        <aside className="order-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:order-1">
          <h2 className="text-xl font-bold">چرا عضویت در هم‌اندیش؟</h2>
          <p className="mt-3 text-sm text-zinc-600">
            با ساخت حساب می‌تونی بحث‌های دلخواهت را دنبال کنی، پست منتشر کنی و شبکه حرفه‌ای
            خودت را بسازی.
          </p>
          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-sm font-semibold">ساخت پروفایل تخصصی</p>
              <p className="mt-1 text-xs text-zinc-600">مهارت‌ها و تجربه‌ات را به جامعه معرفی کن.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-sm font-semibold">دنبال کردن انجمن‌ها</p>
              <p className="mt-1 text-xs text-zinc-600">فقط موضوعات مورد علاقه‌ات را ببین.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-sm font-semibold">تعامل با پست‌ها</p>
              <p className="mt-1 text-xs text-zinc-600">رای بده، نظر بده و گفت‌وگو را پیش ببر.</p>
            </div>
          </div>
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

          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-zinc-700">
                نام نمایشی
              </label>
              <input
                id="name"
                type="text"
                placeholder="مثال: ارشیا"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-orange-500 transition focus:ring-2"
              />
            </div>

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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                  رمز عبور
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="حداقل ۸ کاراکتر"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-orange-500 transition focus:ring-2"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700">
                  تکرار رمز عبور
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="تکرار رمز"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-orange-500 transition focus:ring-2"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
              <input type="checkbox" className="mt-0.5 accent-orange-500" />
              <span>
                با قوانین جامعه و شرایط استفاده موافقم و مسئولیت محتوای منتشرشده را
                می‌پذیرم.
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              ایجاد حساب
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            قبلا عضو شدی؟{" "}
            <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700">
              وارد شو
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
