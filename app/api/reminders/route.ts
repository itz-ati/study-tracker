import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const TABLE = "study_reminder_subscriptions";

function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from(TABLE)
    .select("reminder_enabled, reminder_time, time_zone")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      enabled: data?.reminder_enabled ?? false,
      time: data?.reminder_time?.slice(0, 5) ?? "18:00",
      configured: Boolean(data),
    timeZone: data?.time_zone ?? "",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const enabled = values.enabled;
  const time = values.time;
  const timeZone = values.timeZone;
  const subscription = values.subscription;

  if (typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Choose whether reminders are enabled." }, { status: 400 });
  }

  if (typeof time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return NextResponse.json({ error: "Choose a valid reminder time." }, { status: 400 });
  }

  if (typeof timeZone !== "string" || !isValidTimeZone(timeZone)) {
    return NextResponse.json({ error: "The device time zone is invalid." }, { status: 400 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const settings = {
    reminder_enabled: enabled,
    reminder_time: time,
    time_zone: timeZone,
    updated_at: now,
  };

  // Keep this user's existing devices on the same reminder settings.
  const { error: updateError } = await admin
    .from(TABLE)
    .update(settings)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (enabled) {
    if (!subscription || typeof subscription !== "object") {
      return NextResponse.json(
        { error: "Enable notifications in your browser first." },
        { status: 400 },
      );
    }

    const sub = subscription as {
      endpoint?: unknown;
      keys?: { p256dh?: unknown; auth?: unknown };
    };

    if (
      typeof sub.endpoint !== "string" ||
      !sub.endpoint.startsWith("https://") ||
      typeof sub.keys?.p256dh !== "string" ||
      typeof sub.keys?.auth !== "string"
    ) {
      return NextResponse.json(
        { error: "The browser notification subscription is incomplete." },
        { status: 400 },
      );
    }

    const { error: saveError } = await admin
      .from(TABLE)
      .upsert(
        {
          user_id: user.id,
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          ...settings,
        },
        { onConflict: "endpoint" },
      );

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}