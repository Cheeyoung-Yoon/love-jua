"use client";

import { useEffect, useRef } from "react";

type Petal = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  life: number;
};

interface PetalsCanvasProps {
  burstKey: number;
}

export default function PetalsCanvas({ burstKey }: PetalsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petals = useRef<Petal[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const width = () => canvas.clientWidth;
    const height = () => canvas.clientHeight;

    const spawnBurst = (count = 80) => {
      for (let index = 0; index < count; index += 1) {
        petals.current.push({
          x: width() / 2,
          y: height() / 2,
          vx: (Math.random() * 2 - 1) * 2.5,
          vy: -(Math.random() * 2 + 1) * 2.2,
          r: 6 + Math.random() * 8,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() * 2 - 1) * 0.02,
          life: 1,
        });
      }
    };

    let previous = performance.now();
    const tick = (time: number) => {
      const delta = Math.min(33, time - previous);
      previous = time;

      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      petals.current.forEach((petal) => {
        petal.vy += 0.002 * delta;
        petal.vx += Math.sin(time * 0.001 + petal.rot) * 0.001 * delta;
        petal.x += petal.vx * (delta / 16);
        petal.y += petal.vy * (delta / 16);
        petal.rot += petal.vr * delta;
        if (petal.y > height() + 50) {
          petal.life -= 0.02;
        } else {
          petal.life -= 0.004;
        }
      });

      petals.current = petals.current.filter((petal) => petal.life > 0);

      petals.current.forEach((petal) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, petal.life));
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rot);
        ctx.fillStyle = "rgba(214,177,98,0.9)";
        ctx.shadowColor = "rgba(214,177,98,0.35)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.r, petal.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    spawnBurst(90);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    for (let index = 0; index < 120; index += 1) {
      petals.current.push({
        x: width / 2,
        y: height / 2,
        vx: (Math.random() * 2 - 1) * 3.2,
        vy: -(Math.random() * 2 + 1) * 2.8,
        r: 6 + Math.random() * 10,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() * 2 - 1) * 0.03,
        life: 1,
      });
    }
  }, [burstKey]);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none" }} />;
}
