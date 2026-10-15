"use client";

import { useState, type FormEvent } from "react";

const CONTACT_EMAIL = "bhiterkhan2711@gmail.com";

const faqs = [
  {
    question: "How do I start a study session?",
    answer:
      "Choose a subject and timer mode, then press Start on the Timer page.",
  },
  {
    question: "Where can I see my study history?",
    answer:
      "Open Sessions to view saved sessions, or Dashboard to see your activity and weekly progress.",
  },
  {
    question: "How do daily reminders work?",
    answer:
      "Enable notifications in your browser or installed app, then choose a reminder time on your Dashboard.",
  },
  {
    question: "Is Premium available?",
    answer:
      "Not yet. Premium is being planned; there are no payments or subscriptions to activate right now.",
  },
];

export default function HelpWidget() {
  const [open, setOpen] = useState(false);

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(
      `Study Tracker: ${String(form.get("topic") ?? "Feedback")}`,
    );
    const body = encodeURIComponent(
      `Name: ${String(form.get("name") ?? "")}\n` +
        `Reply email: ${String(form.get("email") ?? "")}\n\n` +
        String(form.get("message") ?? ""),
    );

    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      {open && (
        <section
          role="dialog"
          aria-label="Help and contact"
          className="mb-3 max-h-[75vh] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Help & contact
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close help"
              className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ✕
            </button>
          </div>

          <h3 className="mt-5 font-semibold text-gray-900 dark:text-white">
            Frequently asked questions
          </h3>

          <div className="mt-3 space-y-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-xl border border-gray-200 p-3 dark:border-gray-700"
              >
                <summary className="cursor-pointer text-sm font-medium text-gray-800 dark:text-gray-200">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <h3 className="mt-6 font-semibold text-gray-900 dark:text-white">
            Contact us
          </h3>

          <form onSubmit={handleContactSubmit} className="mt-3 space-y-3">
            <input
              name="name"
              required
              placeholder="Your name"
              aria-label="Your name"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Your email"
              aria-label="Your email"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
            />
            <select
              name="topic"
              aria-label="Contact topic"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option>Feedback</option>
              <option>Report a problem</option>
              <option>Feature suggestion</option>
              <option>Other</option>
            </select>
            <textarea
              name="message"
              required
              rows={3}
              placeholder="How can we help?"
              aria-label="Message"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-violet-700 px-4 py-2 font-medium text-white hover:bg-violet-800"
            >
              Open email to send
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This opens your email app; the website doesn’t send or store the
              message.
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close help and contact" : "Open help and contact"}
        aria-expanded={open}
        className="grid h-12 w-12 place-items-center rounded-full bg-violet-700 text-xl font-bold text-white shadow-lg transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
      >
        {open ? "×" : "?"}
      </button>
    </div>
  );
}