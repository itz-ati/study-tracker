"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/dashboard");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#241044] px-6 text-white">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/30 blur-3xl"
      />

      <section className="relative text-center">
        <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl shadow-purple-950/50 animate-bounce">
          <span className="text-5xl" aria-hidden="true">📚</span>
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Focus • Learn • Grow
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
          Study <span className="text-amber-300">Tracker</span>
        </h1>
        <p className="mt-4 text-purple-100/80">
          Your next study session is just ahead.
        </p>

        <div
          className="mx-auto mt-8 h-1.5 w-40 overflow-hidden rounded-full bg-white/15"
          role="status"
          aria-label="Opening your dashboard"
        >
          <div className="h-full w-1/2 rounded-full bg-amber-300 animate-pulse" />
        </div>
        <p className="mt-3 text-xs text-purple-100/60">
          Opening your dashboard…
        </p>
      </section>
    </main>
  );
}