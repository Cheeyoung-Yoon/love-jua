"use client";

import { create } from "zustand";

export type ScrollState =
  | "Closed"
  | "KnotDragging"
  | "Opening"
  | "Reading"
  | "AutoClosing"
  | "ReKnotting";

const announcements: Record<ScrollState, string> = {
  Closed: "두루마리가 닫혔습니다. 매듭을 풀어 주세요.",
  KnotDragging: "매듭을 잡고 당기는 중입니다.",
  Opening: "두루마리가 펼쳐지는 중입니다.",
  Reading: "편지를 읽을 수 있습니다.",
  AutoClosing: "두루마리가 닫히고 있습니다.",
  ReKnotting: "매듭이 다시 묶이는 중입니다.",
};

interface MachineState {
  state: ScrollState;
  transitionAt: number;
  scrollProgress: number;
  announcement: string;
  setState: (next: ScrollState, meta?: Partial<{ announcement: string }>) => void;
  setScrollProgress: (value: number) => void;
  knotFocusId: number;
  paperFocusId: number;
  openingSeed: number;
  reset: () => void;
}

const focusTargets: Partial<Record<ScrollState, "knot" | "paper">> = {
  Closed: "knot",
  Reading: "paper",
};

export const useScrollMachine = create<MachineState>((set, get) => ({
  state: "Closed",
  transitionAt: Date.now(),
  scrollProgress: 0,
  announcement: announcements.Closed,
  knotFocusId: 1,
  paperFocusId: 0,
  openingSeed: 0,
  setState(next, meta) {
    const current = get().state;
    if (current === next) return;
    const target = focusTargets[next];
    set((prev) => ({
      state: next,
      transitionAt: Date.now(),
      announcement: meta?.announcement ?? announcements[next],
      knotFocusId: target === "knot" ? prev.knotFocusId + 1 : prev.knotFocusId,
      paperFocusId: target === "paper" ? prev.paperFocusId + 1 : prev.paperFocusId,
      openingSeed: next === "Opening" ? prev.openingSeed + 1 : prev.openingSeed,
    }));
    if (next === "Closed") {
      set({ scrollProgress: 0 });
    }
  },
  setScrollProgress(value) {
    const clamped = Math.max(0, Math.min(1, value));
    set({ scrollProgress: clamped });
  },
  reset() {
    set({
      state: "Closed",
      transitionAt: Date.now(),
      scrollProgress: 0,
      announcement: announcements.Closed,
      knotFocusId: get().knotFocusId + 1,
      paperFocusId: get().paperFocusId,
    });
  },
}));
