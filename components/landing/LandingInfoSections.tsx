"use client";

import type { FormEvent } from "react";

const CONTACT_EMAIL = "bhiterkhan2711@gmail.com";

const faqs = [
  {
    question: "What can I do with Study Tracker?",
    answer:
      "Track study sessions, organize subjects and topics, build a study streak, and use the timer with your study buddy.",
  },
  {
    question: "Do I need to install the app?",
    answer:
      "No. You can use Study Tracker in your browser. You can also install it on supported devices for an app-like experience.",
  },
  {
    question: "How do daily reminders work?",
    answer:
      "Allow notifications in your browser or installed app, then choose a reminder time. Your device and browser must support notifications.",
  },
  {
    question: "Can I use Premium features now?",
    answer:
      "Not yet. Premium is planned, and payment is not available. The features and pricing may change before launch.",
  },
  {
    question: "Will I lose my study history if I sign out?",
    answer:
      "Your account data is saved with your account. Sign back in with the same account to access it.",
  },
];

export default function LandingInfoSections() {
  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const topic = String(form.get("topic") ?? "General feedback");
    const message = String(form.get("message") ?? "").trim();

    const subject = encodeURIComponent(`Study Tracker: ${topic}`);
    const body = encodeURIComponent(
      `Name: ${name}\nReply email: ${email}\n\n${message}`,
    );

    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <>
      <section
        id="premium"
        className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
              Simple plans
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Start free. Make progress at your pace.
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              The core study tools are free. Premium is still being planned.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                FREE
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                Study essentials
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Everything you need to build a steady study habit.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                <li>✓ Pomodoro, countdown, and free timer</li>
                <li>✓ Subjects, topics, and session history</li>
                <li>✓ Activity heatmap and study streak</li>
                <li>✓ Daily study reminders on supported devices</li>
                <li>✓ Your animated study buddy</li>
              </ul>

              <a
                href="/signup"
                className="mt-8 inline-flex w-full justify-center rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white transition hover:bg-violet-800"
              >
                Get started free
              </a>
            </article>

            <article className="relative overflow-hidden rounded-3xl border border-violet-300 bg-violet-50 p-6 shadow-sm dark:border-violet-800 dark:bg-violet-950/40 sm:p-8">
              <span className="absolute right-5 top-5 rounded-full bg-violet-200 px-3 py-1 text-xs font-bold text-violet-800 dark:bg-violet-900 dark:text-violet-200">
                COMING SOON
              </span>

              <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                PREMIUM
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                More ways to personalize
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                We’re exploring extra tools for students who want more
                customization and insight.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                <li>• More study insights and progress views</li>
                <li>• Additional pet and workspace customization</li>
                <li>• More ways to organize study goals</li>
              </ul>

              <p className="mt-8 rounded-xl border border-violet-200 bg-white/70 px-4 py-3 text-sm text-violet-900 dark:border-violet-800 dark:bg-gray-900/60 dark:text-violet-100">
                Premium is not available yet. No payment is required.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="scroll-mt-24 bg-gray-50 px-4 py-16 dark:bg-gray-950 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Questions, answered
            </h2>
          </div>

          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
              >
                <summary className="cursor-pointer list-none pr-8 font-semibold text-gray-900 marker:hidden dark:text-white">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="float-right text-violet-600 transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
              Contact
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              We’d like to hear from you.
            </h2>
            <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
              Send feedback, report a problem, or suggest something that would
              make studying easier.
            </p>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
          >
            <div>
              <label
                htmlFor="contact-name"
                className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                Your name
              </label>
              <input
                id="contact-name"
                name="name"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-gray-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                Your email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-gray-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="contact-topic"
                className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                What is this about?
              </label>
              <select
                id="contact-topic"
                name="topic"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              >
                <option>General feedback</option>
                <option>Report a problem</option>
                <option>Feature suggestion</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                className="w-full resize-y rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-gray-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 dark:border-gray-700 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white transition hover:bg-violet-800"
            >
              Open email to send
            </button>

            <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
              This opens your email app with the message filled in. It does not
              send or store the message on the website.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}