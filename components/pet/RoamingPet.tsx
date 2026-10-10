"use client";

import { useEffect, useRef, useState } from "react";
import { useSharedTimer } from "@/app/(dashboard)/timer/TimerContext";
import { createPet } from "./pet-engine";

type PetHandle = {
  destroy: () => void;
};

type Position = {
  left: number;
  top: number;
};

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

function randomPosition(): Position {
  const maxLeft = Math.max(12, window.innerWidth - 240);
  const maxTop = Math.max(200, window.innerHeight - 105);

  return {
    left: 12 + Math.random() * Math.max(0, maxLeft - 12),
    top: 200 + Math.random() * Math.max(0, maxTop - 200),
  };
}

export default function RoamingPet() {
  const timer = useSharedTimer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState<Position>({ left: 20, top: 220 });
  const [controlsOpen, setControlsOpen] = useState(false);
  const [message, setMessage] = useState("Ready to study together? 🐾");
  const [petError, setPetError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let pet: PetHandle | null = null;

    async function initializePet() {
      try {
        if (!canvasRef.current) return;

        const createdPet = await createPet({
          canvas: canvasRef.current,
          stage: false,
          scale: 1.2,
          onStatus: (status: string) => {
            if (!cancelled) setMessage(status);
          },
        });

        if (cancelled) {
          createdPet.destroy();
          return;
        }

        pet = createdPet;
        setPetError("");
      } catch (error: unknown) {
        if (!cancelled) {
          setPetError(
            error instanceof Error ? error.message : "Couldn't load the pet.",
          );
        }
      }
    }

    void initializePet();

    return () => {
      cancelled = true;
      pet?.destroy();
    };
  }, []);

  useEffect(() => {
    const movePet = () => setPosition(randomPosition());
    const interval = window.setInterval(movePet, 6500);

    const keepPetOnScreen = () => {
      setPosition((current) => ({
        left: Math.min(current.left, Math.max(12, window.innerWidth - 240)),
        top: Math.min(current.top, Math.max(200, window.innerHeight - 105)),
      }));
    };

    window.addEventListener("resize", keepPetOnScreen);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("resize", keepPetOnScreen);
    };
  }, []);

  const subjectName =
    timer.subjects.find((subject) => subject.id === timer.selectedSubject)?.name ??
    "No subject selected";

  return (
    <div
      className="pointer-events-none fixed z-[9999] select-none"
      style={{
        left: position.left,
        top: position.top,
        transition: "left 2.5s ease-in-out, top 2.5s ease-in-out",
      }}
    >
      {controlsOpen && (
        <div
          className="pointer-events-auto mb-1 w-56 rounded-xl border border-purple-200 bg-white p-3 text-sm text-gray-800 shadow-lg dark:border-purple-800 dark:bg-gray-900 dark:text-white"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="font-semibold">Your study buddy 🐾</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {petError || message}
          </p>

          <div className="mt-3 rounded-lg bg-purple-50 p-2 dark:bg-purple-950/40">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {timer.mode === "free"
                  ? "Free timer"
                  : timer.mode === "normal"
                    ? "Normal timer"
                    : "Pomodoro"}
              </span>
              <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                {formatTime(timer.seconds)}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
              {subjectName}
              {timer.running ? " · Running" : timer.hasSession ? " · Paused" : ""}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {!timer.running ? (
              <button
                type="button"
                onClick={() => timer.start()}
                className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700"
              >
                {timer.hasSession ? "Resume timer" : "Start timer"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => timer.pause()}
                className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white"
              >
                Pause timer
              </button>
            )}

            {timer.hasSession && (
              <button
                type="button"
                onClick={() => timer.finish()}
                className="rounded-lg border px-3 py-2 text-xs font-medium"
              >
                Finish session
              </button>
            )}

            <button
              type="button"
              onClick={() => setMessage("💧 Remember to drink some water!")}
              className="rounded-lg border px-3 py-2 text-xs font-medium"
            >
              Water reminder
            </button>
            <button
              type="button"
              onClick={() => setControlsOpen(false)}
              className="rounded-lg border px-3 py-2 text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label="Open study buddy controls"
        onClick={() => setControlsOpen((open) => !open)}
        className="pointer-events-auto block cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={300}
          aria-label="Animated roaming pixel pet. Click to open timer controls."
          className="block h-[75px] w-[120px]"
          style={{ imageRendering: "pixelated" }}
        />
      </button>
    </div>
  );
}
