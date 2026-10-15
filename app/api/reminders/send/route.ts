import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const TABLE = "study_reminder_subscriptions";

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  reminder_time: string;
  time_zone: string;
  last_sent_on: string | null;
};

function hasValidSecret(authHeader: string | null, secret: string) {
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authHeader ?? "");

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

function getLocalDateAndTime(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

export async function POST(request: Request) {
  const cronSecret = process.env.PUSH_CRON_SECRET;

  if (!cronSecret || !hasValidSecret(request.headers.get("authorization"), cronSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    return NextResponse.json(
      { error: "Web Push server settings are missing." },
      { status: 500 },
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from(TABLE)
    .select(
      "id, endpoint, p256dh, auth, reminder_time, time_zone, last_sent_on",
    )
    .eq("reminder_enabled", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as SubscriptionRow[];
  const now = new Date();
  let sent = 0;
  let failed = 0;
  let removed = 0;

  for (const row of rows) {
    let local: ReturnType<typeof getLocalDateAndTime>;

    try {
      local = getLocalDateAndTime(now, row.time_zone);
    } catch {
      failed += 1;
      continue;
    }

    if (local.time !== row.reminder_time.slice(0, 5)) continue;
    if (row.last_sent_on === local.date) continue;

    // Claim this user's reminder for today to prevent duplicate sends.
    const { data: claim, error: claimError } = await admin
      .from(TABLE)
      .update({ last_sent_on: local.date, updated_at: now.toISOString() })
      .eq("id", row.id)
      .or(`last_sent_on.is.null,last_sent_on.neq.${local.date}`)
      .select("id")
      .maybeSingle();

    if (claimError) {
      failed += 1;
      continue;
    }
    if (!claim) continue;

    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: {
            p256dh: row.p256dh,
            auth: row.auth,
          },
        },
        JSON.stringify({
    title: "Your study buddy is ready 🐾",
body: "A little study session can make a big difference. Ready to begin?",
          url: "/timer",
        }),
      );

      sent += 1;
    } catch (error) {
      const statusCode =
        typeof error === "object" && error !== null && "statusCode" in error
          ? Number(error.statusCode)
          : 0;

      if (statusCode === 404 || statusCode === 410) {
        await admin.from(TABLE).delete().eq("id", row.id);
        removed += 1;
      } else {
        // Release today's claim if sending failed so the scheduler can retry.
        await admin
          .from(TABLE)
          .update({ last_sent_on: row.last_sent_on })
          .eq("id", row.id)
          .eq("last_sent_on", local.date);

        failed += 1;
      }
    }
  }

  return NextResponse.json({ sent, failed, removed });
}