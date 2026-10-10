import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Session = {
  id: string;
  duration_seconds: number;
  started_at: string;
  mode: string;
  subject_id: string;
};

type Subject = {
  id: string;
  name: string;
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

function formatMode(mode: string) {
  switch (mode) {
    case "pomodoro":
      return "Pomodoro";
    case "normal":
      return "Normal";
    case "free":
      return "Free";
    default:
      return mode;
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SessionsPage() {
  const supabase = await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/login");
  }

  const [
    { data: sessions, error: sessionsError },
    { data: subjects, error: subjectsError },
  ] = await Promise.all([
    supabase
      .from("study_sessions")
      .select(
        "id, duration_seconds, started_at, mode, subject_id"
      )
      .order("started_at", {
        ascending: false,
      }),

    supabase
      .from("subjects")
      .select("id, name")
      .order("name"),
  ]);

  if (sessionsError) {
    console.error(
      "Failed to load sessions:",
      sessionsError
    );
  }

  if (subjectsError) {
    console.error(
      "Failed to load subjects:",
      subjectsError
    );
  }

  const subjectMap = Object.fromEntries(
    (subjects ?? []).map((subject: Subject) => [
      subject.id,
      subject.name,
    ])
  );

  const sessionList = (sessions ?? []) as Session[];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Study Sessions
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View your complete study history.
          </p>
        </div>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          {sessionList.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-medium text-gray-900 dark:text-white">
                No study sessions yet.
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Complete a timer session and it will
                appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {sessionList.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {subjectMap[session.subject_id] ??
                        "Unknown subject"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(session.started_at)}
                      {" · "}
                      {formatTime(session.started_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {formatMode(session.mode)}
                    </span>

                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDuration(
                        session.duration_seconds
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}