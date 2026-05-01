import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-center">
        <p className="text-sm text-zinc-500">خطای ۴۰۴</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">صفحه پیدا نشد</h1>
        <p className="mt-2 text-sm text-zinc-600">
          آدرسی که وارد کردی وجود ندارد یا ممکن است جابه جا شده باشد.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
