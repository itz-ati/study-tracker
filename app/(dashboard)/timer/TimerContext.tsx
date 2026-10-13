"use client";

import {
createContext,
useCallback,
useContext,
useEffect,
useRef,
useState,
type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type TimerMode = "pomodoro" | "normal" | "free";

export type Subject = {
id: string;
name: string;
};

type TimerState = {
mode: TimerMode;
running: boolean;
seconds: number;
hasSession: boolean;
selectedSubject: string;
subjects: Subject[];
pomodoroMinutes: number;
breakMinutes: number;
normalMinutes: number;
loadingSubjects: boolean;
completionCount: number;
};

type TimerContextValue = TimerState & {
setMode: (mode: TimerMode) => void;
setSelectedSubject: (id: string) => void;
setPomodoroMinutes: (minutes: number) => void;
setBreakMinutes: (minutes: number) => void;
setNormalMinutes: (minutes: number) => void;
start: () => void;
pause: () => void;
resume: () => void;
finish: () => void;
reset: () => void;
goToTimer: () => void;
};

const initialState: TimerState = {
mode: "pomodoro",
running: false,
seconds: 25 * 60,
hasSession: false,
selectedSubject: "",
subjects: [],
pomodoroMinutes: 25,
breakMinutes: 5,
normalMinutes: 30,
loadingSubjects: true,
completionCount: 0
};

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
const router = useRouter();
const [supabase] = useState(() => createClient());
const [state, setState] = useState<TimerState>(initialState);
const stateRef = useRef(state);

// These refs preserve accurate timing when the timer is paused or resumed.
const sessionStartedAtRef = useRef<number | null>(null);
const runStartedAtRef = useRef<number | null>(null);
const elapsedBeforeRunRef = useRef(0);
const savingRef = useRef(false);

const update = useCallback((next: TimerState) => {
stateRef.current = next;
setState(next);
}, []);

const durationFor = useCallback((s: TimerState) => {
if (s.mode === "pomodoro") return s.pomodoroMinutes * 60;
if (s.mode === "normal") return s.normalMinutes * 60;
return 0;
}, []);

useEffect(() => {
let cancelled = false;


async function loadSubjects() {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name");

  if (cancelled) return;

  if (error) {
    console.error("Couldn't load subjects:", error.message);
  }
update({
  ...stateRef.current,
  subjects: data ?? [],
  loadingSubjects: false,
});
}

void loadSubjects();
return () => {
  cancelled = true;
};


}, [supabase, update]);

const saveSession = useCallback(
async (durationSeconds: number, startedAt: number, s: TimerState) => {
if (!s.selectedSubject || durationSeconds <= 0) return;

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    console.error("Couldn't identify the current user for the study session.");
    return;
  }

  const { error } = await supabase.from("study_sessions").insert({
    subject_id: s.selectedSubject,
    started_at: new Date(startedAt).toISOString(),
    duration_seconds: Math.floor(durationSeconds),
    user_id: authData.user.id,
    mode: s.mode,
  });

  if (error) {
    console.error("Couldn't save study session:", error.message);
    window.alert(`Couldn't save study session: ${error.message}`);
  }
},
[supabase],

);

const clearSessionRefs = useCallback(() => {
sessionStartedAtRef.current = null;
runStartedAtRef.current = null;
elapsedBeforeRunRef.current = 0;
}, []);

const start = useCallback(() => {
const current = stateRef.current;
if (current.running) return;


if (!current.selectedSubject) {
  window.alert("Please select a subject first.");
  return;
}

if (current.mode !== "free" && current.seconds <= 0) {
  update({ ...current, seconds: durationFor(current) });
}

const now = Date.now();

if (!current.hasSession) {
  sessionStartedAtRef.current = now;
  elapsedBeforeRunRef.current = 0;
}

runStartedAtRef.current = now;

update({
  ...current,
  running: true,
  hasSession: true,
  seconds:
    current.mode !== "free" && current.seconds <= 0
      ? durationFor(current)
      : current.seconds,
});


}, [durationFor, update]);

const pause = useCallback(() => {
const current = stateRef.current;
if (!current.running) return;


const now = Date.now();
const runStartedAt = runStartedAtRef.current ?? now;

elapsedBeforeRunRef.current += Math.floor(
  (now - runStartedAt) / 1000,
);

runStartedAtRef.current = null;

const elapsed = elapsedBeforeRunRef.current;
const seconds =
  current.mode === "free"
    ? elapsed
    : Math.max(0, durationFor(current) - elapsed);

update({ ...current, running: false, seconds });


}, [durationFor, update]);

const resume = useCallback(() => {
start();
}, [start]);

const finish = useCallback(() => {
const current = stateRef.current;
const now = Date.now();
let elapsed = elapsedBeforeRunRef.current;


if (current.running && runStartedAtRef.current !== null) {
  elapsed += Math.floor((now - runStartedAtRef.current) / 1000);
}

const startedAt = sessionStartedAtRef.current;

update({
  ...current,
  running: false,
  hasSession: false,
  seconds: durationFor(current),
  completionCount:
    current.completionCount + (current.hasSession ? 1 : 0),
});

clearSessionRefs();

if (startedAt !== null && elapsed > 0 && !savingRef.current) {
  savingRef.current = true;
  void saveSession(elapsed, startedAt, current).finally(() => {
    savingRef.current = false;
  });
}


}, [clearSessionRefs, durationFor, saveSession, update]);

const reset = useCallback(() => {
  const current = stateRef.current;
  clearSessionRefs();

  const next = {
    ...current,
    running: false,
    hasSession: false,
    selectedSubject: "",
    seconds: durationFor(current),
  };

  update(next);
}, [clearSessionRefs, durationFor, update]);

const setMode = useCallback(
(mode: TimerMode) => {
const current = stateRef.current;
clearSessionRefs();

  const next = { ...current, mode, running: false, hasSession: false };
  next.seconds =
    mode === "free"
      ? 0
      : mode === "pomodoro"
        ? next.pomodoroMinutes * 60
        : next.normalMinutes * 60;

  update(next);
},
[clearSessionRefs, update],


);

const setSelectedSubject = useCallback(
(selectedSubject: string) => {
update({ ...stateRef.current, selectedSubject });
},
[update],
);

const setPomodoroMinutes = useCallback(
(value: number) => {
const minutes = Math.max(1, Math.min(180, Math.floor(value) || 1));
const current = stateRef.current;
const next = { ...current, pomodoroMinutes: minutes };
if (!current.running && current.mode === "pomodoro") {
next.seconds = minutes * 60;
}
update(next);
},
[update],
);

const setBreakMinutes = useCallback(
(value: number) => {
const minutes = Math.max(1, Math.min(60, Math.floor(value) || 1));
update({ ...stateRef.current, breakMinutes: minutes });
},
[update],
);

const setNormalMinutes = useCallback(
(value: number) => {
const minutes = Math.max(1, Math.min(720, Math.floor(value) || 1));
const current = stateRef.current;
const next = { ...current, normalMinutes: minutes };
if (!current.running && current.mode === "normal") {
next.seconds = minutes * 60;
}
update(next);
},
[update],
);

useEffect(() => {
if (!state.running) return;


const interval = window.setInterval(() => {
  const current = stateRef.current;
  if (!current.running) return;

  const now = Date.now();
  const startedAt = runStartedAtRef.current ?? now;
  const elapsed =
    elapsedBeforeRunRef.current +
    Math.floor((now - startedAt) / 1000);

  if (current.mode === "free") {
    update({ ...current, seconds: elapsed });
    return;
  }

  const remaining = Math.max(0, durationFor(current) - elapsed);

  if (remaining === 0) {
    const sessionStartedAt = sessionStartedAtRef.current;

   update({
  ...current,
  seconds: 0,
  running: false,
  hasSession: false,
  completionCount: current.completionCount + 1,
});

    clearSessionRefs();

    if (
      sessionStartedAt !== null &&
      elapsed > 0 &&
      !savingRef.current
    ) {
      savingRef.current = true;
      void saveSession(elapsed, sessionStartedAt, current).finally(() => {
        savingRef.current = false;
      });
    }

    return;
  }

  update({ ...current, seconds: remaining });
}, 250);

return () => window.clearInterval(interval);


}, [state.running, state.mode, durationFor, update, clearSessionRefs, saveSession]);

const goToTimer = useCallback(() => {
router.push("/timer");
}, [router]);

return (
<TimerContext.Provider
value={{
...state,
setMode,
setSelectedSubject,
setPomodoroMinutes,
setBreakMinutes,
setNormalMinutes,
start,
pause,
resume,
finish,
reset,
goToTimer,
}}
>
{children}
</TimerContext.Provider>
);
}

export function useSharedTimer() {
const context = useContext(TimerContext);
if (!context) {
throw new Error("useSharedTimer must be used inside TimerProvider.");
}
return context;
}
