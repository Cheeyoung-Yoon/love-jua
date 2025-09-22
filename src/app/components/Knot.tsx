"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import { UNTIE_THRESHOLD } from "../lib/springs";
import type { ScrollState } from "../lib/state";

interface KnotProps {
  onUntied: () => void;
  onBegin: () => void;
  onCancel: () => void;
  focusToken: number;
  state: ScrollState;
}

const Knot = ({ onUntied, onBegin, onCancel, focusToken, state }: KnotProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const totalDistance = useRef(0);
  const [progress, setProgress] = useState(0);
  const fade = useMotionValue(1);
  const translateLeft = useMotionValue(0);
  const translateRight = useMotionValue(0);
  const rotateLeft = useMotionValue(0);
  const rotateRight = useMotionValue(0);
  const holdTimer = useRef<number | null>(null);

  useEffect(() => {
    if (state === "Closed") {
      setProgress(0);
      fade.set(1);
      translateLeft.set(0);
      translateRight.set(0);
      rotateLeft.set(0);
      rotateRight.set(0);
    }
    if (focusToken && (state === "Closed" || state === "KnotDragging")) {
      buttonRef.current?.focus();
    }
  }, [state, focusToken, fade, translateLeft, translateRight, rotateLeft, rotateRight]);

  const reset = () => {
    totalDistance.current = 0;
    setProgress(0);
    animate(translateLeft, 0, { duration: 0.3, ease: "easeOut" });
    animate(translateRight, 0, { duration: 0.3, ease: "easeOut" });
    animate(rotateLeft, 0, { duration: 0.3, ease: "easeOut" });
    animate(rotateRight, 0, { duration: 0.3, ease: "easeOut" });
    onCancel();
  };

  const triggerUntie = () => {
    onUntied();
    animate(fade, 0, { duration: 0.25, ease: "easeInOut" });
    animate(translateLeft, -28, { duration: 0.3, ease: "easeOut" });
    animate(translateRight, 28, { duration: 0.3, ease: "easeOut" });
    animate(rotateLeft, -18, { duration: 0.3, ease: "easeOut" });
    animate(rotateRight, 18, { duration: 0.3, ease: "easeOut" });
    setTimeout(() => {
      fade.set(0);
    }, 400);
  };

  useDrag(
    ({ first, delta, cancel, last }) => {
      if (state !== "Closed" && state !== "KnotDragging") {
        cancel();
        return;
      }
      if (first) {
        onBegin();
        totalDistance.current = 0;
        fade.set(1);
      }
      const distance = Math.hypot(delta[0], delta[1]);
      totalDistance.current += distance;
      const ratio = Math.min(1, totalDistance.current / UNTIE_THRESHOLD);
      setProgress(ratio);
      translateLeft.set(-ratio * 24);
      translateRight.set(ratio * 24);
      rotateLeft.set(-ratio * 15);
      rotateRight.set(ratio * 15);
      if (ratio >= 1) {
        cancel();
        triggerUntie();
      }
      if (last && ratio < 1) {
        reset();
      }
    },
    { target: buttonRef }
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.code === "Space" && holdTimer.current == null && (state === "Closed" || state === "KnotDragging")) {
      onBegin();
      holdTimer.current = window.setTimeout(() => {
        holdTimer.current = null;
        triggerUntie();
      }, 700);
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.code === "Space" && holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
      reset();
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      role="button"
      aria-label="두루마리 매듭 풀기"
      aria-pressed={state !== "Closed"}
      className="relative mx-auto mt-16 flex h-28 w-56 select-none items-center justify-center rounded-full border border-[#d5b770]/60 bg-[#21160a]/90 px-6 py-4 text-[#fdf3d6] shadow-[0_20px_35px_rgba(0,0,0,0.4)] transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-[#caa84f]/80 focus:ring-offset-2 focus:ring-offset-[#fdfaf2]"
      style={{ opacity: fade }}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_70%)]" />
      <div className="flex items-center space-x-3 text-lg font-semibold tracking-[0.08em]">
        <motion.span
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#caa84f] bg-[#f4e5bc] text-[#7a5f1f]"
          style={{ translateX: translateLeft, rotate: rotateLeft }}
        >
          결
        </motion.span>
        <motion.span
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#caa84f] bg-[#f4e5bc] text-[#7a5f1f]"
          style={{ translateX: translateRight, rotate: rotateRight }}
        >
          속
        </motion.span>
      </div>
      <div className="absolute -bottom-10 flex flex-col items-center text-xs text-[#7a5f1f]">
        <span className="font-medium">드래그하여 매듭을 풀어요</span>
        <span className="mt-1 h-1 w-32 rounded-full bg-[#f6e8c2]/40">
          <span
            className="block h-full rounded-full bg-[#caa84f] transition-[width] duration-75"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </span>
        <span className="mt-1 text-[11px] opacity-70">스페이스바를 0.7초간 누르고 있어도 풀립니다</span>
      </div>
    </motion.button>
  );
};

export default Knot;
