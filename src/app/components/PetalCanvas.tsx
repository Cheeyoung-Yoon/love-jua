"use client";

import { memo, useEffect, useRef } from "react";
import { useAnimationFrame } from "framer-motion";
import {
  Petal,
  createOpeningBurst,
  spawnReadingPetal,
  updatePetals,
  PetalMode,
} from "../lib/particles";

interface PetalCanvasProps {
  mode: PetalMode;
  burstKey: number;
  openingCount?: number;
  readingCount?: number;
  active: boolean;
}

const PetalCanvas = memo(function PetalCanvas({
  mode,
  burstKey,
  openingCount = 10,
  readingCount = 4,
  active,
}: PetalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const lastTimeRef = useRef<number | null>(null);
  const burstRef = useRef<number>(burstKey);
  const spawnTimerRef = useRef(0);
  const ratioRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      ratioRef.current = dpr;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (mode === "opening" && burstKey !== burstRef.current) {
      burstRef.current = burstKey;
      petalsRef.current = createOpeningBurst(openingCount, canvas.clientWidth, canvas.clientHeight);
    }
    if (mode === "reading" && burstKey !== burstRef.current) {
      burstRef.current = burstKey;
      petalsRef.current = [];
    }
    if (!active) {
      petalsRef.current = [];
    }
  }, [mode, burstKey, openingCount, active]);

  useAnimationFrame((time) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const width = canvas.clientWidth || canvas.width / ratioRef.current;
    const height = canvas.clientHeight || canvas.height / ratioRef.current;
    if (width === 0 || height === 0) return;

    if (!active) {
      ctx.setTransform(ratioRef.current, 0, 0, ratioRef.current, 0, 0);
      ctx.clearRect(0, 0, width, height);
      lastTimeRef.current = time;
      return;
    }

    const previous = lastTimeRef.current ?? time;
    lastTimeRef.current = time;
    const dt = Math.min(0.05, Math.max(0.016, (time - previous) / 1000));

    if (mode === "reading") {
      spawnTimerRef.current += dt;
      const target = Math.max(3, Math.min(6, readingCount));
      while (petalsRef.current.length < target) {
        petalsRef.current.push(spawnReadingPetal(width, height));
      }
      const spawnInterval = 1.2;
      if (spawnTimerRef.current > spawnInterval) {
        petalsRef.current.push(spawnReadingPetal(width, height));
        spawnTimerRef.current = 0;
      }
    }

    petalsRef.current = updatePetals(petalsRef.current, dt, width, height);

    ctx.setTransform(ratioRef.current, 0, 0, ratioRef.current, 0, 0);
    ctx.clearRect(0, 0, width, height);

    for (const petal of petalsRef.current) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, petal.opacity));
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);
      const w = petal.size;
      const h = petal.size * 1.6;
      const gradient = ctx.createRadialGradient(0, 0, w * 0.15, 0, 0, w);
      gradient.addColorStop(0, "rgba(255, 208, 216, 0.8)");
      gradient.addColorStop(0.4, "rgba(230, 84, 120, 0.7)");
      gradient.addColorStop(1, "rgba(176, 18, 43, 0.45)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.4);
      ctx.bezierCurveTo(w * 0.8, -h * 0.6, w * 0.8, h * 0.4, 0, h * 0.5);
      ctx.bezierCurveTo(-w * 0.8, h * 0.4, -w * 0.8, -h * 0.6, 0, -h * 0.4);
      ctx.fill();
      ctx.restore();
    }
  });

  return <canvas ref={canvasRef} className="absolute inset-0 -z-10" aria-hidden />;
});

export default PetalCanvas;
