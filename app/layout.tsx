import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MobileBottomNav } from "./components/mobile-bottom-nav";
import { PwaRegister } from "./components/pwa-register";

const iranSans = localFont({
  src: [
    {
      path: "../public/fonts/IRANSans-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/IRANSans-Reg.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/IRANSans-SemiBold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/IRANSans-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-iran-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "هم‌اندیش",
  description: "نسخه اولیه پلتفرم گفت‌وگو برای کاربران فارسی‌زبان",
  applicationName: "هم‌اندیش",
  appleWebApp: {
    capable: true,
    title: "هم‌اندیش",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${iranSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        <div className="flex-1 pb-24 md:pb-0">{children}</div>
        <MobileBottomNav />
      </body>
    </html>
  );
}
