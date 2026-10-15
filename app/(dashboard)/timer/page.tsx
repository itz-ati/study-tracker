"use client";

import { useSharedTimer } from "./TimerContext";

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function TimerPage() {
  const timer = useSharedTimer();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Study Timer</h1>
        <p className="mt-2 text-gray-500">
          Focus, study, and build your progress.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {(["pomodoro", "normal", "free"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            disabled={timer.running || timer.hasSession}
            onClick={() => timer.setMode(mode)}
            className={`rounded-lg px-2 py-3 text-sm font-medium capitalize ${
              timer.mode === mode
                ? "bg-white shadow dark:bg-gray-700"
                : "text-gray-500"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {mode === "free" ? "Free Timer" : mode === "normal" ? "Normal" : "Pomodoro"}
          </button>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border p-6 text-center sm:p-8">
        <label
          htmlFor="study-subject"
          className="mb-2 block text-left text-sm font-medium"
        >
          Study subject
        </label>

       <select
  id="study-subject"
  value={timer.selectedSubject}
  onChange={(event) => timer.setSelectedSubject(event.target.value)}
  disabled={timer.running || timer.hasSession || timer.loadingSubjects}
  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
>
  <option
    value=""
    className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"
  >
    {timer.loadingSubjects ? "Loading subjects..." : "Select a subject"}
  </option>

  {timer.subjects.map((subject) => (
    <option
      key={subject.id}
      value={subject.id}
      className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"
    >
      {subject.name}
    </option>
  ))}
</select>

        {!timer.loadingSubjects && timer.subjects.length === 0 && (
          <p className="mt-2 text-left text-sm text-amber-600">
            No subjects found. Add a subject before starting a session.
          </p>
        )}

        <div className="mt-8 break-all text-6xl font-bold tracking-tight sm:text-7xl">
          {formatTime(timer.seconds)}
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {timer.mode === "pomodoro"
            ? "Focus session"
            : timer.mode === "normal"
              ? "Countdown"
              : "Open-ended session"}
          {timer.running ? " · Running" : timer.hasSession ? " · Paused" : ""}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!timer.running ? (
            <button
              type="button"
              onClick={timer.start}
              className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700"
            >
              {timer.hasSession ? "Resume" : "Start"}
            </button>
          ) : (
            <button
              type="button"
              onClick={timer.pause}
              className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white"
            >
              Pause
            </button>
          )}

          <button
            type="button"
            onClick={timer.finish}
            disabled={!timer.hasSession}
            className="rounded-lg border px-6 py-3 font-medium disabled:opacity-40"
          >
            Finish
          </button>

          <button
            type="button"
            onClick={timer.reset}
            className="rounded-lg border px-6 py-3 font-medium"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl border p-6">
        {timer.mode === "pomodoro" && (
          <>
            <div>
              <label
                htmlFor="focus-duration"
                className="mb-2 block text-sm font-medium"
              >
                Focus duration (minutes)
              </label>
              <input
                id="focus-duration"
                type="number"
                min={1}
                max={180}
                value={timer.pomodoroMinutes}
                disabled={timer.running || timer.hasSession}
                onChange={(event) =>
                  timer.setPomodoroMinutes(Number(event.target.value))
                }
                className="w-full rounded-lg border bg-transparent px-3 py-2"
              />
            </div>

            <div>
              <label
                htmlFor="break-duration"
                className="mb-2 block text-sm font-medium"
              >
                Break duration (minutes)
              </label>
              <input
                id="break-duration"
                type="number"
                min={1}
                max={60}
                value={timer.breakMinutes}
                onChange={(event) =>
                  timer.setBreakMinutes(Number(event.target.value))
                }
                className="w-full rounded-lg border bg-transparent px-3 py-2"
              />
            </div>
          </>
        )}

        {timer.mode === "normal" && (
          <div>
            <label
              htmlFor="normal-duration"
              className="mb-2 block text-sm font-medium"
            >
              Timer duration (minutes)
            </label>
            <input
              id="normal-duration"
              type="number"
              min={1}
              max={720}
              value={timer.normalMinutes}
              disabled={timer.running || timer.hasSession}
              onChange={(event) =>
                timer.setNormalMinutes(Number(event.target.value))
              }
              className="w-full rounded-lg border bg-transparent px-3 py-2"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {[10, 30, 60].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  disabled={timer.running || timer.hasSession}
                  onClick={() => timer.setNormalMinutes(minutes)}
                  className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>
        )}

        {timer.mode === "free" && (
          <p className="text-sm text-gray-500">
            The timer counts upward until you finish or reset it.
          </p>
        )}
      </section>

      <p className="mt-4 text-center text-xs text-gray-500">
        Your pet and this page use the same timer.
      </p>
    </main>
  );
}