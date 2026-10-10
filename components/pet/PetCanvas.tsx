"use client";

import { useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPet } from "./pet-engine";

type Stats = {
hunger: number;
energy: number;
mood: number;
};

type PetHandle = {
act: (action: "feed" | "play" | "rest" | "pet") => void;
getStats: () => Stats;
destroy: () => void;
};

type Props = {
supabase: SupabaseClient;
userId: string;
};

const SAVE_EVERY_MS = 15_000;

function StatBar({
label,
value,
color,
}: {
label: string;
value: number;
color: string;
}) {
const safeValue = Math.max(0, Math.min(100, value));

return ( <div> <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-300"> <span>{label}</span> <span>{Math.round(safeValue)}%</span> </div>


  <div
    className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
    role="progressbar"
    aria-label={label}
    aria-valuenow={Math.round(safeValue)}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div
      className="h-full rounded-full transition-all duration-300"
      style={{
        width: `${safeValue}%`,
        backgroundColor: color,
      }}
    />
  </div>
</div>


);
}

export default function PetCanvas({ supabase, userId }: Props) {
const canvasRef = useRef<HTMLCanvasElement>(null);
const petRef = useRef<PetHandle | null>(null);

const [status, setStatus] = useState("Getting your pet ready…");
const [stats, setStats] = useState<Stats>({
hunger: 70,
energy: 80,
mood: 70,
});
const [error, setError] = useState<string | null>(null);

useEffect(() => {
let cancelled = false;
let timer: ReturnType<typeof setInterval> | undefined;
let save: (() => void) | undefined;


function onHidden() {
  if (document.visibilityState === "hidden") {
    save?.();
  }
}

async function initializePet() {
  try {
    setError(null);
    setStatus("Getting your pet ready…");

    const { data, error: loadError } = await supabase
      .from("pets")
      .select("hunger, energy, mood, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (loadError) {
      throw loadError;
    }

    if (cancelled || !canvasRef.current) {
      return;
    }

    const elapsedSeconds = data?.updated_at
      ? Math.max(
          0,
          (Date.now() - new Date(data.updated_at).getTime()) / 1000,
        )
      : 0;

    const pet: PetHandle = await createPet({
      canvas: canvasRef.current,
      initial: data
        ? {
            hunger: data.hunger,
            energy: data.energy,
            mood: data.mood,
          }
        : undefined,
      elapsedSeconds,
      onStatus: (message: string) => {
        if (!cancelled) setStatus(message);
      },
      onStats: (nextStats: object) => {
  if (!cancelled) {
    const petStats = nextStats as Stats;
    setStats(petStats);
  }
},
    });

    if (cancelled) {
      pet.destroy();
      return;
    }

    petRef.current = pet;

    save = () => {
      void (async () => {
        const { error: saveError } = await supabase
          .from("pets")
          .upsert(
            {
              user_id: userId,
              ...pet.getStats(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );

        if (cancelled) return;

        if (saveError) {
          setError(`Couldn't save pet stats: ${saveError.message}`);
        } else {
          setError(null);
        }
      })();
    };

    save();
    timer = setInterval(save, SAVE_EVERY_MS);

    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHidden);
  } catch (cause: unknown) {
    if (!cancelled) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Something went wrong loading your pet.";

      setError(message);
      setStatus("Your pet couldn't load");
    }
  }
}

void initializePet();

return () => {
  cancelled = true;

  if (timer) {
    clearInterval(timer);
  }

  if (save) {
    window.removeEventListener("pagehide", save);
  }

  document.removeEventListener("visibilitychange", onHidden);

  // Stop animation before saving the final stats.
  const pet = petRef.current;
  petRef.current = null;
  pet?.destroy();

  if (save) {
    save();
  }
};
}, [supabase, userId]);

function act(action: "feed" | "play" | "rest" | "pet") {
petRef.current?.act(action);
}

return ( <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/60 dark:bg-gray-900"> <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 dark:border-purple-900/60 dark:from-purple-950/50 dark:to-pink-950/30"> <div> <h2 className="text-lg font-bold text-gray-900 dark:text-white">
🐾 Your Study Buddy </h2> <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
Take a little break and make your buddy happy. </p> </div>


    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-gray-800 dark:text-purple-300">
      {error ? "Needs attention" : status}
    </span>
  </div>

  <div className="p-4 sm:p-5">
    <div className="overflow-hidden rounded-xl border border-sky-100 bg-sky-50 dark:border-gray-700 dark:bg-gray-800">
      <canvas
        ref={canvasRef}
        width={480}
        height={300}
        aria-label="Your animated pixel pet. Click it to give it a pat."
        className="block w-full cursor-pointer"
      />
    </div>

    {error && (
      <p
        role="alert"
        className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
      >
        {error}
      </p>
    )}

    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatBar label="🍎 Hunger" value={stats.hunger} color="#F59E0B" />
      <StatBar label="⚡ Energy" value={stats.energy} color="#38BDF8" />
      <StatBar label="💖 Mood" value={stats.mood} color="#F472B6" />
    </div>

    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <button
        type="button"
        onClick={() => act("feed")}
        className="rounded-xl bg-amber-100 px-3 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/60"
      >
        🍎 Feed
      </button>

      <button
        type="button"
        onClick={() => act("play")}
        className="rounded-xl bg-sky-100 px-3 py-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-950/50 dark:text-sky-200 dark:hover:bg-sky-900/60"
      >
        🎾 Play
      </button>

      <button
        type="button"
        onClick={() => act("rest")}
        className="rounded-xl bg-indigo-100 px-3 py-3 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-900/60"
      >
        💤 Rest
      </button>

      <button
        type="button"
        onClick={() => act("pet")}
        className="rounded-xl bg-pink-100 px-3 py-3 text-sm font-semibold text-pink-900 transition hover:bg-pink-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 dark:bg-pink-950/50 dark:text-pink-200 dark:hover:bg-pink-900/60"
      >
        💗 Give a pat
      </button>
    </div>

    <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
      Your buddy&apos;s stats save automatically. Clicking the character
      gives it a pat, too!
    </p>
  </div>
</section>


);
}
