import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Premium | Study Tracker",
  description: "Compare the free and planned Premium Study Tracker features.",
};

const freeFeatures = [
  "Pomodoro, countdown, and free timer",
  "Subjects, topics, and study session history",
  "Activity heatmap, streak, and weekly goal",
  "Daily reminders on supported devices",
  "Animated study buddy",
];

const plannedFeatures = [
  "More study insights and progress views",
  "More pet and workspace customization",
  "Additional ways to organize study goals",
];

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">
            Study Tracker plans
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Build a study routine that works for you.
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            The core study tools are free. Premium is being planned and is not
            available for purchase yet.
          </p>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <p className="font-semibold text-violet-700 dark:text-violet-300">
              FREE
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              Study essentials
            </h2>
            <ul className="mt-6 space-y-3 text-gray-700 dark:text-gray-200">
              {freeFeatures.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white hover:bg-violet-800"
            >
              Go to your dashboard
            </Link>
          </section>

          <section className="rounded-3xl border border-violet-300 bg-violet-50 p-6 dark:border-violet-800 dark:bg-violet-950/40 sm:p-8">
            <span className="inline-flex rounded-full bg-violet-200 px-3 py-1 text-xs font-bold text-violet-900 dark:bg-violet-900 dark:text-violet-100">
              COMING SOON
            </span>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Premium
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              We’re exploring extra ways to personalize your study space and
              understand your progress.
            </p>
            <ul className="mt-6 space-y-3 text-gray-700 dark:text-gray-200">
              {plannedFeatures.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <p className="mt-8 rounded-xl bg-white/70 p-4 text-sm text-violet-950 dark:bg-gray-900/60 dark:text-violet-100">
              Premium isn’t available yet. There is no checkout or payment
              right now.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}