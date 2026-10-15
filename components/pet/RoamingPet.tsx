"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSharedTimer } from "@/app/(dashboard)/timer/TimerContext";

type Action = "idle" | "walk" | "sad" | "happy";

type DragState = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
  lastClientX: number;
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

export default function RoamingPet() {
  const timer = useSharedTimer();
  const pathname = usePathname();

  const [x, setX] = useState(12);
  const [y, setY] = useState(0);
  const [freePosition, setFreePosition] = useState(false);
  const [direction, setDirection] = useState(1);
  const [celebrating, setCelebrating] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dragging, setDragging] = useState(false);

  const petRef = useRef<HTMLElement | null>(null);
  const xRef = useRef(12);
  const yRef = useRef(0);
  const directionRef = useRef(1);
  const dragRef = useRef<DragState | null>(null);
  const lastCompletionRef = useRef(timer.completionCount);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (timer.completionCount === lastCompletionRef.current) return;

    lastCompletionRef.current = timer.completionCount;
    setCelebrating(true);

    const timeout = window.setTimeout(() => setCelebrating(false), 2500);
    return () => window.clearTimeout(timeout);
  }, [timer.completionCount]);

  const shouldRoam =
    !isAuthPage &&
    !hidden &&
    !celebrating &&
    !dragging &&
    (!timer.hasSession || timer.running);

  useEffect(() => {
    if (!shouldRoam) return;

    let frame = 0;
    let previousTime = 0;

    function move(now: number) {
      const petWidth = petRef.current?.offsetWidth ?? 96;
      const maxX = Math.max(8, window.innerWidth - petWidth - 8);
      const elapsed = previousTime
        ? Math.min((now - previousTime) / 1000, 0.05)
        : 0;

      previousTime = now;

      let nextX = xRef.current + directionRef.current * 42 * elapsed;

      if (nextX >= maxX) {
        nextX = maxX;
        directionRef.current = -1;
        setDirection(-1);
      } else if (nextX <= 8) {
        nextX = 8;
        directionRef.current = 1;
        setDirection(1);
      }

      xRef.current = nextX;
      setX(Math.round(nextX));
      frame = window.requestAnimationFrame(move);
    }

    frame = window.requestAnimationFrame(move);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [shouldRoam]);

  useEffect(() => {
    function keepOnScreen() {
      const petWidth = petRef.current?.offsetWidth ?? 96;
      const maxX = Math.max(8, window.innerWidth - petWidth - 8);
      const nextX = Math.min(Math.max(xRef.current, 8), maxX);

      xRef.current = nextX;
      setX(Math.round(nextX));

      if (freePosition) {
        const petHeight = petRef.current?.offsetHeight ?? 180;
        const maxY = Math.max(8, window.innerHeight - petHeight - 8);
        const nextY = Math.min(Math.max(yRef.current, 8), maxY);

        yRef.current = nextY;
        setY(Math.round(nextY));
      }
    }

    window.addEventListener("resize", keepOnScreen);
    return () => window.removeEventListener("resize", keepOnScreen);
  }, [freePosition]);

  function finishDragging(pointerId: number) {
    if (dragRef.current?.pointerId !== pointerId) return;

    dragRef.current = null;
    setDragging(false);
  }

  if (isAuthPage) return null;

 const action: Action = celebrating
  ? "happy"
  : timer.running
    ? "walk"
    : timer.hasSession
      ? "sad"
      : "idle";
      
  const message = celebrating
    ? "Session complete! 🎉"
    : timer.hasSession && !timer.running
      ? "Taking a pause."
      : timer.running
        ? "Studying with you!"
        : "Ready when you are.";

  return (
    <>
      <div className="pointer-events-none fixed right-3 top-20 z-[60] flex items-center gap-2 bg-transparent">
        <button
          type="button"
          onClick={() => setHidden((value) => !value)}
          aria-label={hidden ? "Show study buddy" : "Hide study buddy"}
          className="pointer-events-auto bg-transparent text-xs text-gray-600/70 hover:text-purple-700 dark:text-gray-300/70 dark:hover:text-purple-300"
        >
          {hidden ? "Show pet" : "Hide pet"}
        </button>

        {hidden && timer.running && (
          <span
            aria-label="Time remaining"
            className="text-xs text-gray-600/70 dark:text-gray-300/70"
          >
            {formatTime(timer.seconds)}
          </span>
        )}
      </div>

      {!hidden && (
        <aside
          ref={petRef}
          style={{
            left: `${x}px`,
            ...(freePosition ? { top: `${y}px` } : {}),
          }}
          className={`pointer-events-auto touch-none select-none cursor-grab active:cursor-grabbing fixed z-40 w-24 bg-transparent sm:w-32 ${
            freePosition ? "" : "bottom-3 sm:bottom-5"
          }`}
          onPointerDown={(event) => {
            if (event.button !== 0) return;

            const bounds = event.currentTarget.getBoundingClientRect();

            xRef.current = bounds.left;
            yRef.current = bounds.top;
            setX(bounds.left);
            setY(bounds.top);
            setFreePosition(true);

            dragRef.current = {
              pointerId: event.pointerId,
              offsetX: event.clientX - bounds.left,
              offsetY: event.clientY - bounds.top,
              lastClientX: event.clientX,
            };

            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;

            const petWidth = event.currentTarget.offsetWidth;
            const petHeight = event.currentTarget.offsetHeight;
            const maxX = Math.max(8, window.innerWidth - petWidth - 8);
            const maxY = Math.max(8, window.innerHeight - petHeight - 8);

            const nextX = Math.min(
              Math.max(event.clientX - drag.offsetX, 8),
              maxX,
            );
            const nextY = Math.min(
              Math.max(event.clientY - drag.offsetY, 8),
              maxY,
            );

            xRef.current = nextX;
            yRef.current = nextY;
            setX(Math.round(nextX));
            setY(Math.round(nextY));

            const delta = event.clientX - drag.lastClientX;
            if (Math.abs(delta) > 1) {
              const nextDirection = delta < 0 ? -1 : 1;
              directionRef.current = nextDirection;
              setDirection(nextDirection);
            }

            drag.lastClientX = event.clientX;
          }}
          onPointerUp={(event) => finishDragging(event.pointerId)}
          onPointerCancel={(event) => finishDragging(event.pointerId)}
          onLostPointerCapture={(event) => finishDragging(event.pointerId)}
        >
          <div
            aria-live="polite"
            className={`jin-bubble ${
              direction < 0 ? "jin-bubble--left" : "jin-bubble--right"
            }`}
          >
            {message}
          </div>

          <div
            className={`jin-sprite jin-sprite--${action}${
              direction < 0 ? " jin-sprite--flipped" : ""
            }`}
            role="img"
            aria-label={`Study buddy: ${message}`}
          />
        </aside>
      )}
    </>
  );
}