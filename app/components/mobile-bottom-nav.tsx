"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import { FaFire, FaHouse, FaPenToSquare, FaUsers } from "react-icons/fa6";

const navItems = [
  { id: "home", href: "/", label: "خانه", icon: FaHouse },
  { id: "communities", href: "/communities", label: "انجمن‌ها", icon: FaUsers },
  { id: "create", href: "/communities/create", label: "ساخت", icon: FaPenToSquare },
  { id: "trending", href: "/", label: "ترند", icon: FaFire },
] satisfies { id: string; href: string; label: string; icon: IconType }[];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-2 backdrop-blur md:hidden">
      <ul className="mx-auto flex w-full max-w-lg items-center justify-between gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === "home"
              ? pathname === "/"
              : item.id === "trending"
                ? pathname === "/trending" ||
                  pathname.startsWith("/trending/")
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.id} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                }`}
              >
                <Icon aria-hidden className="size-4" />
                <span className="mt-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
