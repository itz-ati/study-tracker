"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

export default function RecentSessions() {
  const supabase = createClient();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      const [
        { data: sessionData, error: sessionError },
        { data: subjectData, error: subjectError },
      ] = await Promise.all([
        supabase
          .from("study_sessions")
          .select(
            "id, duration_seconds, started_at, mode, subject_id"
          )
          .order("started_at", {
            ascending: false,
          })
          .limit(10),

        supabase
          .from("subjects")
          .select("id, name")
          .order("name"),
      ]);

      if (sessionError) {
        console.error(
          "Failed to load recent sessions:",
          sessionError
        );
      }

      if (subjectError) {
        console.error(
          "Failed to load subjects:",
          subjectError
        );
      }

      setSessions(sessionData ?? []);
      setSubjects(subjectData ?? []);
      setLoading(false);
    }

    loadSessions();
  }, []);

  const subjectMap = Object.fromEntries(
    subjects.map((subject) => [
      subject.id,
      subject.name,
    ])
  );

  return (
    <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Sessions
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your latest study sessions.
          </p>
        </div>

        <Link
          href="/sessions"
          className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          View all sessions →
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            No study sessions yet.
          </p>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Complete a timer session and it will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-gray-200 dark:divide-gray-800">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">
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
  );
}