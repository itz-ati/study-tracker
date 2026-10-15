"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/timer",
    label: "Timer",
  },
  {
  href: "/subjects",
  label: "Subjects",
},
  {
    href: "/sessions",
    label: "Sessions",
  },
  {
  href: "/premium",
  label: "Premium",
},
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight text-gray-900 dark:text-white"
        >
          Study Tracker
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="ml-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 md:hidden dark:border-gray-700 dark:text-gray-300"
          aria-label="Toggle navigation"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-200 px-4 py-3 md:hidden dark:border-gray-800">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium ${
                    active
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 disabled:opacity-50 dark:text-red-400"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}