"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import { FaFire, FaHome, FaUsers } from "react-icons/fa";

const navItems = [
  { href: "/", label: "خانه", icon: FaHome },
  { href: "/communities/startup", label: "انجمن‌ها", icon: FaUsers },
  { href: "/communities/web-dev", label: "ترند", icon: FaFire },
] satisfies { href: string; label: string; icon: IconType }[];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-2 backdrop-blur md:hidden">
      <ul className="mx-auto flex w-full max-w-lg items-center justify-between gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                }`}
              >
                <span className="text-base leading-none">
                  <Icon aria-hidden className="size-4" />
                </span>
                <span className="mt-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
