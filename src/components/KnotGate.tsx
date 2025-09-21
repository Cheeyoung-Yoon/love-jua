"use client";

import type { PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/knot.module.css";

interface KnotGateProps {
  onUntie: () => void;
}

type Point = { x: number; y: number };

export default function KnotGate({ onUntie }: KnotGateProps) {
  const radius = 120;
  const releaseDistance = radius + 40;
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [released, setReleased] = useState(false);
  const sealRef = useRef<HTMLDivElement | null>(null);
  const pointerId = useRef<number | null>(null);
  const startOffset = useRef<Point>({ x: 0, y: 0 });
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const distance = useMemo(() => Math.hypot(position.x, position.y), [position]);
  const ringScale = 1 + (Math.min(distance, radius) / radius) * 0.06;
  const hintOpacity = Math.max(0, 0.6 - (distance / radius) * 0.4);

  useEffect(() => {
    return () => {
      if (releaseTimer.current) {
        clearTimeout(releaseTimer.current);
      }
    };
  }, []);

  const resetPointer = () => {
    if (pointerId.current !== null && sealRef.current) {
      try {
        sealRef.current.releasePointerCapture(pointerId.current);
      } catch {
        // ignore pointer release issues
      }
    }
    pointerId.current = null;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (released) return;
    pointerId.current = event.pointerId;
    startOffset.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    setIsAnimating(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (released || pointerId.current !== event.pointerId) return;
    const next: Point = {
      x: event.clientX - startOffset.current.x,
      y: event.clientY - startOffset.current.y,
    };
    setPosition(next);
  };

  const triggerRelease = () => {
    if (released) return;
    setReleased(true);
    setIsAnimating(true);
    setPosition((prev) => ({ x: prev.x + 200, y: prev.y - 200 }));
    releaseTimer.current = setTimeout(() => {
      onUntie();
    }, 350);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (released || pointerId.current !== event.pointerId) return;
    if (distance > releaseDistance) {
      triggerRelease();
    } else {
      setIsAnimating(true);
      setPosition({ x: 0, y: 0 });
    }
    resetPointer();
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (released || pointerId.current !== event.pointerId) return;
    setIsAnimating(true);
    setPosition({ x: 0, y: 0 });
    resetPointer();
  };

  const handleTransitionEnd = () => {
    if (!released) {
      setIsAnimating(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.paper} />
      <div className={styles.ring} style={{ transform: `scale(${ringScale.toFixed(3)})` }} />
      <div
        ref={sealRef}
        className={`${styles.seal} ${released ? styles.sealReleased : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: isAnimating ? "transform 0.25s ease" : "transform 0s linear",
        }}
      >
        <span>결</span>
      </div>
      <div className={styles.hint} style={{ opacity: hintOpacity }}>
        클릭 & 드래그로 매듭을 풀어주세요
      </div>
    </div>
  );
}
