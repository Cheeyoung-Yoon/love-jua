"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import Knot from "./Knot";
import Rod from "./Rod";
import LetterBody from "./LetterBody";
import PetalCanvas from "./PetalCanvas";
import RoseBloom from "./RoseBloom";
import { useScrollMachine, type ScrollState } from "../lib/state";
import {
  OPEN_DURATION,
  CLOSE_DURATION,
  REKNOT_DURATION,
  ROD_OPEN_ANGLE,
  ROD_SCROLL_ROTATIONS,
  waveOffset,
} from "../lib/springs";

interface ScrollPaperProps {
  initialOpen?: boolean;
  onStateChange?: (state: ScrollState) => void;
}

const ScrollPaper = ({ initialOpen = false, onStateChange }: ScrollPaperProps) => {
  const {
    state,
    setState,
    scrollProgress,
    setScrollProgress,
    announcement,
    knotFocusId,
    paperFocusId,
    openingSeed,
  } = useScrollMachine((store) => ({
    state: store.state,
    setState: store.setState,
    scrollProgress: store.scrollProgress,
    setScrollProgress: store.setScrollProgress,
    announcement: store.announcement,
    knotFocusId: store.knotFocusId,
    paperFocusId: store.paperFocusId,
    openingSeed: store.openingSeed,
  }));

  const openProgress = useMotionValue(initialOpen ? 1 : 0);
  const paperOpacity = useMotionValue(initialOpen ? 1 : 0);
  const waveMotion = useMotionValue(0);
  const leftRotation = useMotionValue(0);
  const rightRotation = useMotionValue(0);
  const heightMotion = useMotionValue(0);
  const desiredHeightRef = useRef(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window === "undefined" ? 800 : window.innerHeight
  );
  const audioCtxRef = useRef<AudioContext | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (initialOpen) {
      setState("Opening");
    }
  }, [initialOpen, setState]);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      setViewportHeight(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const desiredHeight = useMemo(() => {
    const base = viewportHeight * 0.8 + contentHeight;
    return Math.max(420, base);
  }, [viewportHeight, contentHeight]);

  useEffect(() => {
    desiredHeightRef.current = desiredHeight;
    heightMotion.set(openProgress.get() * desiredHeight);
  }, [desiredHeight, heightMotion, openProgress]);

  useEffect(() => {
    const unsub = openProgress.onChange((value) => {
      paperOpacity.set(Math.min(1, Math.max(0, value)));
      heightMotion.set(value * desiredHeightRef.current);
    });
    return unsub;
  }, [openProgress, paperOpacity, heightMotion]);

  const updateRodAngles = useCallback(() => {
    const openAngle = ROD_OPEN_ANGLE * openProgress.get();
    const scrollAngle = state === "Reading" ? ROD_SCROLL_ROTATIONS * scrollProgress : 0;
    leftRotation.set(openAngle + scrollAngle);
    rightRotation.set(-openAngle - scrollAngle);
  }, [leftRotation, rightRotation, openProgress, scrollProgress, state]);

  useEffect(() => {
    updateRodAngles();
    const unsub = openProgress.onChange(updateRodAngles);
    return unsub;
  }, [openProgress, updateRodAngles]);

  useEffect(() => {
    updateRodAngles();
  }, [scrollProgress, state, updateRodAngles]);

  useEffect(() => {
    waveMotion.set(waveOffset(scrollProgress));
  }, [scrollProgress, waveMotion]);

  const handleProgress = useCallback(
    (value: number) => {
      setScrollProgress(value);
    },
    [setScrollProgress]
  );

  const playTone = useCallback((frequency: number) => {
    if (typeof window === "undefined") return;
    const win = window as Window & {
      AudioContext?: typeof globalThis.AudioContext;
      webkitAudioContext?: typeof globalThis.AudioContext;
    };
    const Context = win.AudioContext ?? win.webkitAudioContext;
    if (!Context) return;
    try {
      const ctx = audioCtxRef.current ?? new Context();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.5);
    } catch {
      // ignore playback issues
    }
  }, []);

  useEffect(() => {
    if (state === "Opening") {
      playTone(620);
    }
    if (state === "AutoClosing" || state === "ReKnotting") {
      playTone(320);
    }
  }, [state, playTone]);

  useEffect(() => {
    return () => {
      try {
        audioCtxRef.current?.close();
      } catch {
        // ignore errors closing the context
      }
    };
  }, []);

  useEffect(() => {
    if (state === "Opening") {
      animate(openProgress, 1, {
        duration: OPEN_DURATION,
        ease: "easeInOut",
      }).then(() => {
        setState("Reading");
      });
    }
    if (state === "AutoClosing") {
      animate(openProgress, 0, {
        duration: CLOSE_DURATION,
        ease: "easeInOut",
      }).then(() => {
        setState("ReKnotting");
      });
    }
    if (state === "ReKnotting") {
      const timer = window.setTimeout(() => {
        setState("Closed");
      }, REKNOT_DURATION * 1000);
      return () => window.clearTimeout(timer);
    }
    if (state === "Closed") {
      openProgress.set(0);
      paperOpacity.set(0);
    }
    if (state === "Reading") {
      openProgress.set(1);
      paperOpacity.set(1);
    }
    return () => {};
  }, [state, setState, openProgress, paperOpacity]);

  useEffect(() => {
    if (state === "Reading" && scrollProgress >= 0.98) {
      const timer = window.setTimeout(() => {
        setState("AutoClosing");
      }, 600);
      return () => window.clearTimeout(timer);
    }
    return () => {};
  }, [state, scrollProgress, setState]);

  const showKnot = state === "Closed" || state === "KnotDragging";
  const allowScroll = state === "Reading";
  const petalMode = state === "Opening" ? "opening" : "reading";
  const petalActive = state !== "Closed";

  return (
    <section
      role="document"
      className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-12"
    >
      <div className="relative w-full overflow-visible">
        <div className="silk-frame mx-auto flex w-full flex-col items-center px-4 py-10 sm:px-10">
          <PetalCanvas
            mode={petalMode}
            burstKey={openingSeed}
            openingCount={10}
            readingCount={4}
            active={petalActive}
          />
          <div className="absolute inset-x-0 top-4 flex justify-center" aria-hidden>
            <RoseBloom active={state === "Opening"} />
          </div>
          <div className="relative flex w-full justify-between pt-6">
            <Rod side="left" rotation={leftRotation} />
            <Rod side="right" rotation={rightRotation} />
          </div>
          <motion.div
            className="paper-surface relative z-10 mt-6 w-full max-w-2xl overflow-hidden border border-[#e7dcc4]/60 px-6 pb-12 pt-10"
            style={{
              height: heightMotion,
              opacity: paperOpacity,
              translateY: waveMotion,
            }}
          >
            <LetterBody
              isActive={allowScroll}
              onProgress={handleProgress}
              onContentHeight={setContentHeight}
              focusToken={paperFocusId}
            />
          </motion.div>
        </div>
        {showKnot && (
          <div className="pointer-events-auto">
            <Knot
              state={state}
              onBegin={() => setState("KnotDragging")}
              onCancel={() => setState("Closed")}
              onUntied={() => setState("Opening")}
              focusToken={knotFocusId}
            />
          </div>
        )}
      </div>
      <div className="live-region" aria-live="polite">
        {announcement}
      </div>
    </section>
  );
};

export default ScrollPaper;
