"use client";

import { useEffect, useState } from "react";

type SavedSettings = {
  enabled: boolean;
  time: string;
  timeZone: string;
  configured: boolean;
};

function vapidKeyToBytes(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }

  return bytes;
}

async function saveSettings(
  enabled: boolean,
  time: string,
  timeZone: string,
  subscription: PushSubscriptionJSON | null,
) {
  const response = await fetch("/api/reminders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled, time, timeZone, subscription }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Could not save reminder settings.");
  }
}

export default function ReminderSettings() {
  const [supported, setSupported] = useState(false);
  const [iosNeedsHomeScreen, setIosNeedsHomeScreen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("18:00");
  const [timeZone, setTimeZone] = useState("UTC");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const browserTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    setTimeZone(browserTimeZone);

    const canPush =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(canPush);

    const isIOS =
      /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setIosNeedsHomeScreen(isIOS && !isInstalled);

    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch("/api/reminders", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not load reminder settings.");
        }

        if (cancelled) return;

        const saved = result as SavedSettings;
        setEnabled(saved.enabled);
        setTime(saved.time);

        if (saved.configured && saved.timeZone) {
          setTimeZone(saved.timeZone);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Could not load reminder settings.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  async function getPushSubscription() {
    if (!supported) {
      throw new Error("This browser does not support web push notifications.");
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error("The public VAPID key is missing from the app settings.");
    }

    // Call this from a button click so the browser can ask for permission.
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      throw new Error("Allow notifications in your browser to enable reminders.");
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyToBytes(publicKey),
      });
    }

    return subscription;
  }

  async function handleEnable() {
    setBusy(true);
    setMessage("");

    try {
      const subscription = await getPushSubscription();

      await saveSettings(true, time, timeZone, subscription.toJSON());

      setEnabled(true);
      setMessage(`Daily reminder enabled for ${time} (${timeZone}).`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not enable reminders.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveTime() {
    setBusy(true);
    setMessage("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        throw new Error("No notification subscription found. Turn reminders off, then on again.");
      }

      await saveSettings(true, time, timeZone, subscription.toJSON());
      setMessage(`Reminder time saved: ${time} (${timeZone}).`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save reminder time.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    setMessage("");

    try {
      await saveSettings(false, time, timeZone, null);
      setEnabled(false);
      setMessage("Daily reminders are disabled.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not disable reminders.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Daily study reminder
      </h2>

      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Choose when you’d like a reminder. It uses this device’s time zone:
        {" "}{timeZone}.
      </p>

      {iosNeedsHomeScreen && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          On iPhone or iPad, add Study Tracker to your Home Screen before
          enabling notifications.
        </p>
      )}

      {!supported && !loading && (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
          This browser doesn’t support web push notifications.
        </p>
      )}

      <label
        htmlFor="study-reminder-time"
        className="mt-4 block text-sm font-medium text-gray-800 dark:text-gray-200"
      >
        Reminder time
      </label>

      <input
        id="study-reminder-time"
        type="time"
        value={time}
        onChange={(event) => setTime(event.target.value)}
        disabled={loading || busy}
        className="mt-2 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-900 dark:border-gray-700 dark:text-white"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        {!enabled ? (
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading || busy || !supported}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Please wait…" : "Enable daily reminder"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleSaveTime}
              disabled={loading || busy}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Please wait…" : "Save time"}
            </button>

            <button
              type="button"
              onClick={handleDisable}
              disabled={loading || busy}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Disable reminders
            </button>
          </>
        )}
      </div>

      {message && (
        <p aria-live="polite" className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>
      )}
    </section>
  );
}