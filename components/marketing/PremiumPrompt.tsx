"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

export default function PremiumPrompt() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeout: number | undefined;

    async function checkWhenToShow() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      setUserId(user.id);

      const firstSeenKey = `study-tracker:first-seen:${user.id}`;
      const dismissedKey = `study-tracker:premium-dismissed:${user.id}`;

      if (localStorage.getItem(dismissedKey)) return;

      const savedFirstSeen = localStorage.getItem(firstSeenKey);
      let firstSeen = savedFirstSeen ? Number(savedFirstSeen) : Date.now();

      if (!Number.isFinite(firstSeen) || firstSeen > Date.now()) {
        firstSeen = Date.now();
      }

      if (!savedFirstSeen || !Number.isFinite(Number(savedFirstSeen))) {
        localStorage.setItem(firstSeenKey, String(firstSeen));
      }

      const elapsed = Date.now() - firstSeen;
      const remaining = THREE_DAYS - elapsed;

      if (remaining <= 0) {
        setOpen(true);
      } else {
        timeout = window.setTimeout(() => {
          if (!cancelled) setOpen(true);
        }, remaining);
      }
    }

    void checkWhenToShow();

    return () => {
      cancelled = true;
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    };
  }, []);

  function dismiss() {
    if (userId) {
      localStorage.setItem(
        `study-tracker:premium-dismissed:${userId}`,
        "true",
      );
    }

    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4"
      role="presentation"
      onClick={dismiss}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-prompt-title"
        className="w-full max-w-md rounded-3xl border border-violet-200 bg-white p-6 shadow-2xl dark:border-violet-900 dark:bg-gray-900 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
          A little thank-you
        </p>

        <h2
          id="premium-prompt-title"
          className="mt-2 text-2xl font-bold text-gray-900 dark:text-white"
        >
          Ready for more?
        </h2>

        <p className="mt-3 leading-6 text-gray-600 dark:text-gray-300">
          Premium features are being planned, with more ways to personalize
          your study space and explore your progress. Premium isn’t available
          yet, and there’s nothing to pay for now.
        </p>

        <button
          type="button"
          onClick={dismiss}
          className="mt-6 w-full rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white hover:bg-violet-800"
        >
          Got it
        </button>
      </section>
    </div>
  );
}