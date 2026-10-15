import Link from "next/link";
import LandingInfoSections from "@/components/landing/LandingInfoSections";

const features = [
  {
    title: "Focus with a timer",
    description:
      "Choose Pomodoro, countdown, or free timer sessions to match the way you study.",
    icon: "⏱️",
  },
  {
    title: "Keep subjects organized",
    description:
      "Group your study sessions by subject and keep track of the topics you cover.",
    icon: "📚",
  },
  {
    title: "See your progress",
    description:
      "Use your activity history, streak, and weekly goal to see your consistency grow.",
    icon: "📈",
  },
  {
    title: "Build a steady routine",
    description:
      "Set a daily reminder and let your study buddy keep you company.",
    icon: "🐾",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        >
          <Link href="/" className="font-bold tracking-tight">
            Study Tracker
          </Link>

          <div className="flex items-center gap-3 text-sm font-medium sm:gap-5">
            <a className="hidden hover:text-violet-700 sm:inline" href="#premium">
              Premium
            </a>
            <a className="hidden hover:text-violet-700 sm:inline" href="#faq">
              FAQ
            </a>
            <a className="hidden hover:text-violet-700 sm:inline" href="#contact">
              Contact
            </a>
            <Link className="hover:text-violet-700" href="/login">
              Log in
            </Link>
            <Link
              className="rounded-lg bg-violet-700 px-3 py-2 text-white transition hover:bg-violet-800 sm:px-4"
              href="/signup"
            >
              Get started
            </Link>
          </div>
        </nav>

        <nav
          aria-label="Section navigation"
          className="flex justify-center gap-6 border-t border-gray-100 px-4 py-2 text-xs font-medium sm:hidden dark:border-gray-800"
        >
          <a href="#premium">Premium</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-violet-900 to-fuchsia-900 px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl"
          />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200">
                Focus · Learn · Grow
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Make time for the goals that matter.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-violet-100">
                Plan study sessions, build a routine, and see your progress—all
                with a little help from your study buddy.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="rounded-xl bg-white px-5 py-3 font-semibold text-violet-900 transition hover:bg-violet-100"
                >
                  Start studying for free
                </Link>
                <a
                  href="#features"
                  className="rounded-xl border border-white/30 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Explore features
                </a>
              </div>
            </div>

            <div
              aria-label="Study Tracker app preview"
              className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-6"
            >
              <div className="rounded-2xl bg-white p-5 text-gray-900 shadow-xl sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Your study space</p>
                    <h2 className="mt-1 text-xl font-bold">Keep your rhythm</h2>
                  </div>
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
                    Today
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-violet-50 p-5 text-center">
                  <p className="text-sm font-medium text-violet-800">
                    Focus session
                  </p>
                  <p className="mt-2 font-mono text-5xl font-bold tracking-tight text-violet-950">
                    25:00
                  </p>
                  <div className="mt-4 inline-flex rounded-lg bg-violet-700 px-5 py-2 text-sm font-semibold text-white">
                    Start studying
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">This week</p>
                    <p className="mt-1 text-lg font-bold">Study sessions</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Your buddy</p>
                    <p className="mt-1 text-lg font-bold">Ready to focus 🐾</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-violet-100/80">
                App preview
              </p>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
                Made for your routine
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                The tools to keep showing up
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6"
                >
                  <span aria-hidden="true" className="text-3xl">
                    {feature.icon}
                  </span>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <LandingInfoSections />
      </main>

      <footer className="border-t border-gray-200 px-4 py-8 dark:border-gray-800 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between dark:text-gray-400">
          <span>© {new Date().getFullYear()} Study Tracker</span>
          <span>Focus at your own pace.</span>
        </div>
      </footer>
    </div>
  );
}