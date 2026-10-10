"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type StudySession = {
  duration_seconds: number;
  started_at: string;
  subject_id: string;
};

type Subject = {
  id: string;
  name: string;
};

const CELL_SIZE = 20;
const GAP = 5;

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

export default function ActivityHeatmap() {
  const supabase = createClient();

  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [weeklyGoalHours, setWeeklyGoalHours] =
    useState(10);

  const [editingGoal, setEditingGoal] =
    useState(false);

  const [goalInput, setGoalInput] =
    useState("10");

  const [savingGoal, setSavingGoal] =
    useState(false);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          "Failed to get current user:",
          userError
        );
        return;
      }

      const [
        { data: sessionData, error: sessionError },
        { data: subjectData, error: subjectError },
        { data: preferenceData, error: preferenceError },
      ] = await Promise.all([
        supabase
          .from("study_sessions")
          .select(
            "duration_seconds, started_at, subject_id"
          )
          .order("started_at", {
            ascending: true,
          }),

        supabase
          .from("subjects")
          .select("id, name")
          .order("name"),

        supabase
          .from("user_preferences")
          .select("weekly_goal_hours")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (sessionError) {
        console.error(
          "Failed to load study sessions:",
          sessionError
        );
        return;
      }

      if (subjectError) {
        console.error(
          "Failed to load subjects:",
          subjectError
        );
        return;
      }

      if (preferenceError) {
        console.error(
          "Failed to load user preferences:",
          preferenceError
        );
        return;
      }

      setSessions(sessionData ?? []);
      setSubjects(subjectData ?? []);

      if (preferenceData) {
        setWeeklyGoalHours(
          preferenceData.weekly_goal_hours
        );

        setGoalInput(
          String(
            preferenceData.weekly_goal_hours
          )
        );
      }
    }

    loadData();
  }, []);

  const dailyTotals = useMemo(() => {
    return sessions.reduce<Record<string, number>>(
      (totals, session) => {
        const dateKey = getDateKey(
          new Date(session.started_at)
        );

        totals[dateKey] =
          (totals[dateKey] ?? 0) +
          session.duration_seconds;

        return totals;
      },
      {}
    );
  }, [sessions]);

  const days = useMemo(() => {
    const result: Date[] = [];
    const today = new Date();

    for (let i = 363; i >= 0; i--) {
      const date = new Date(today);

      date.setDate(today.getDate() - i);

      result.push(date);
    }

    return result;
  }, []);

  const weeks = useMemo(() => {
    const result: Date[][] = [];

    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }

    return result;
  }, [days]);

  const monthLabels = useMemo(() => {
    const labels: {
      name: string;
      weekIndex: number;
    }[] = [];

    let previousMonth = -1;

    weeks.forEach((week, index) => {
      const date = week[0];

      if (!date) return;

      const month = date.getMonth();

      if (month !== previousMonth) {
        labels.push({
          name: date.toLocaleString("en-US", {
            month: "short",
          }),
          weekIndex: index,
        });

        previousMonth = month;
      }
    });

    return labels;
  }, [weeks]);

  const subjectMap = useMemo(() => {
    return Object.fromEntries(
      subjects.map((subject) => [
        subject.id,
        subject.name,
      ])
    );
  }, [subjects]);

  function getLevel(minutes: number) {
    if (minutes <= 0) {
      return 0;
    }

    if (minutes < 60) {
      return 1;
    }

    if (minutes < 120) {
      return 2;
    }

    return 3;
  }

  function getCellClass(level: number) {
    switch (level) {
      case 1:
        return "bg-purple-200 dark:bg-purple-300";

      case 2:
        return "bg-purple-500 dark:bg-purple-500";

      case 3:
        return "bg-purple-900 dark:bg-purple-700";

      default:
        return "bg-gray-200 dark:bg-gray-800";
    }
  }

  async function saveWeeklyGoal() {
    const value = Number(goalInput);

    if (
      !Number.isInteger(value) ||
      value < 1 ||
      value > 168
    ) {
      alert(
        "Weekly goal must be between 1 and 168 hours."
      );
      return;
    }

    setSavingGoal(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "Failed to get current user:",
        userError
      );

      setSavingGoal(false);
      return;
    }

    const { error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          weekly_goal_hours: value,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      console.error(
        "Failed to save weekly goal:",
        error
      );

      alert(
        `Could not save weekly goal:\n${error.message}`
      );

      setSavingGoal(false);
      return;
    }

    setWeeklyGoalHours(value);
    setGoalInput(String(value));
    setEditingGoal(false);
    setSavingGoal(false);
  }

  const selectedSessions = selectedDate
    ? sessions.filter(
        (session) =>
          getDateKey(
            new Date(session.started_at)
          ) === selectedDate
      )
    : [];

  const selectedTotalSeconds = selectedDate
    ? dailyTotals[selectedDate] ?? 0
    : 0;

  const selectedSubjectTotals =
    selectedSessions.reduce<Record<string, number>>(
      (totals, session) => {
        totals[session.subject_id] =
          (totals[session.subject_id] ?? 0) +
          session.duration_seconds;

        return totals;
      },
      {}
    );

  // Last 30 days

  const last30Days = days.slice(-30);

  const last30DayKeys = new Set(
    last30Days.map((date) => getDateKey(date))
  );

  const last30DaySeconds = Object.entries(
    dailyTotals
  )
    .filter(([date]) =>
      last30DayKeys.has(date)
    )
    .reduce(
      (total, [, seconds]) =>
        total + seconds,
      0
    );

  const last30DayActiveDays =
    Object.entries(dailyTotals).filter(
      ([date, seconds]) =>
        last30DayKeys.has(date) &&
        seconds > 0
    ).length;

  // Current streak

  let currentStreak = 0;

  for (let i = 0; i < days.length; i++) {
    const date =
      days[days.length - 1 - i];

    if (!date) {
      break;
    }

    const dateKey = getDateKey(date);

    if ((dailyTotals[dateKey] ?? 0) > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Weekly goal

  const WEEKLY_GOAL_SECONDS =
    weeklyGoalHours * 60 * 60;

  const now = new Date();

  const startOfWeek = new Date(now);

  startOfWeek.setDate(
    now.getDate() - now.getDay()
  );

  startOfWeek.setHours(0, 0, 0, 0);

  const weeklySeconds = sessions
    .filter((session) => {
      const sessionDate = new Date(
        session.started_at
      );

      return sessionDate >= startOfWeek;
    })
    .reduce(
      (total, session) =>
        total + session.duration_seconds,
      0
    );

  const weeklyProgress =
    WEEKLY_GOAL_SECONDS > 0
      ? Math.min(
          100,
          Math.round(
            (weeklySeconds /
              WEEKLY_GOAL_SECONDS) *
              100
          )
        )
      : 0;

  return (
    <section className="w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Study Activity
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your study consistency over the last year.
          </p>
        </div>

        {/* Weekly Goal */}

        <div className="flex items-center gap-3">
          {editingGoal ? (
            <>
              <input
                type="number"
                min="1"
                max="168"
                value={goalInput}
                onChange={(event) =>
                  setGoalInput(
                    event.target.value
                  )
                }
                disabled={savingGoal}
                className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              <span className="text-sm text-gray-500 dark:text-gray-400">
                hours
              </span>

              <button
                type="button"
                onClick={saveWeeklyGoal}
                disabled={savingGoal}
                className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingGoal
                  ? "Saving..."
                  : "Save"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setGoalInput(
                    String(
                      weeklyGoalHours
                    )
                  );

                  setEditingGoal(false);
                }}
                disabled={savingGoal}
                className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50 dark:text-gray-400 dark:hover:text-white"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Weekly goal
                </p>

                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDuration(
                    weeklySeconds / 60
                  )}{" "}
                  / {weeklyGoalHours} hr
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setGoalInput(
                    String(
                      weeklyGoalHours
                    )
                  );

                  setEditingGoal(true);
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Weekly progress */}

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-purple-600 transition-all duration-500"
            style={{
              width: `${weeklyProgress}%`,
            }}
          />
        </div>
      </div>

      {/* Summary */}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last 30 days
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {formatDuration(
              last30DaySeconds / 60
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Study sessions
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {sessions.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Active days
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {last30DayActiveDays}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Current streak
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {currentStreak}{" "}
            {currentStreak === 1
              ? "day"
              : "days"}
          </p>
        </div>
      </div>

      {/* Heatmap */}

      <div className="mt-10 overflow-x-auto pb-5">
        <div
          className="relative"
          style={{
            minWidth: `${
              weeks.length *
              (CELL_SIZE + GAP)
            }px`,
          }}
        >
          {/* Month labels */}

          <div
            className="relative mb-3 h-5"
            style={{
              marginLeft: "32px",
            }}
          >
            {monthLabels.map((month) => (
              <span
                key={`${month.name}-${month.weekIndex}`}
                className="absolute text-xs font-medium text-gray-500 dark:text-gray-400"
                style={{
                  left: `${
                    month.weekIndex *
                    (CELL_SIZE + GAP)
                  }px`,
                }}
              >
                {month.name}
              </span>
            ))}
          </div>

          <div className="flex">
            {/* Weekday labels */}

            <div
              className="mr-2 grid shrink-0"
              style={{
                gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                gap: `${GAP}px`,
              }}
            >
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <span
                  key={day}
                  className="text-[10px] text-gray-400"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Heatmap cells */}

            <div
              className="grid grid-flow-col"
              style={{
                gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                gridAutoColumns: `${CELL_SIZE}px`,
                gap: `${GAP}px`,
              }}
            >
              {weeks.map(
                (week, weekIndex) =>
                  Array.from({
                    length: 7,
                  }).map(
                    (_, dayIndex) => {
                      const date =
                        week[dayIndex];

                      if (!date) {
                        return (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            style={{
                              width:
                                CELL_SIZE,
                              height:
                                CELL_SIZE,
                            }}
                          />
                        );
                      }

                      const dateKey =
                        getDateKey(date);

                      const seconds =
                        dailyTotals[
                          dateKey
                        ] ?? 0;

                      const minutes =
                        seconds / 60;

                      const level =
                        getLevel(
                          minutes
                        );

                      const daySessions =
                        sessions.filter(
                          (session) =>
                            getDateKey(
                              new Date(
                                session.started_at
                              )
                            ) ===
                            dateKey
                        );

                      const subjectNames =
                        Array.from(
                          new Set(
                            daySessions
                              .map(
                                (
                                  session
                                ) =>
                                  subjectMap[
                                    session
                                      .subject_id
                                  ]
                              )
                              .filter(
                                Boolean
                              )
                          )
                        );

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() =>
                            setSelectedDate(
                              dateKey
                            )
                          }
                          title={`${date.toLocaleDateString(
                            "en-US",
                            {
                              month:
                                "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )} • ${
                            minutes > 0
                              ? formatDuration(
                                  minutes
                                )
                              : "No study"
                          }${
                            subjectNames.length
                              ? ` • ${subjectNames.join(
                                  ", "
                                )}`
                              : ""
                          }`}
                          className={`cursor-pointer rounded-[4px] transition-transform duration-150 hover:scale-125 ${getCellClass(
                            level
                          )}`}
                          style={{
                            width:
                              CELL_SIZE,
                            height:
                              CELL_SIZE,
                          }}
                        />
                      );
                    }
                  )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected day */}

      {selectedDate && (
        <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-900 dark:bg-purple-950/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {new Date(
                  `${selectedDate}T00:00:00`
                ).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatDuration(
                  selectedTotalSeconds /
                    60
                )}{" "}
                studied
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedDate(null)
              }
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sessions
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedSessions.length}{" "}
              study sessions
            </p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Subjects
            </p>

            <div className="mt-2 space-y-2">
              {Object.entries(
                selectedSubjectTotals
              ).map(
                ([subjectId, seconds]) => (
                  <div
                    key={subjectId}
                    className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 dark:bg-gray-900/50"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {subjectMap[
                        subjectId
                      ] ??
                        "Unknown subject"}
                    </span>

                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {formatDuration(
                        seconds / 60
                      )}
                    </span>
                  </div>
                )
              )}

              {selectedSessions.length ===
                0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No study sessions on
                  this day.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>

        <span className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-800" />

        <span className="h-4 w-4 rounded bg-purple-200 dark:bg-purple-300" />

        <span className="h-4 w-4 rounded bg-purple-500" />

        <span className="h-4 w-4 rounded bg-purple-900 dark:bg-purple-700" />

        <span>More</span>
      </div>
    </section>
  );
}