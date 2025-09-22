export type PetalMode = "opening" | "reading";

export interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
  fade: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function createOpeningBurst(count: number, width: number, height: number): Petal[] {
  const petals: Petal[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const maxSpeed = Math.max(width, height) * 0.35;
  for (let i = 0; i < count; i += 1) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(maxSpeed * 0.3, maxSpeed * 0.6);
    petals.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: rand(-Math.PI, Math.PI),
      vr: rand(-1.2, 1.2),
      life: 0,
      maxLife: rand(1.2, 1.8),
      size: rand(width * 0.04, width * 0.08),
      opacity: 1,
      fade: rand(0.5, 0.8),
    });
  }
  return petals;
}

export function spawnReadingPetal(width: number, height: number): Petal {
  const x = rand(width * 0.2, width * 0.8);
  const baseSpeed = Math.max(12, height * 0.06);
  const speed = rand(baseSpeed * 0.6, baseSpeed);
  const startY = -Math.max(20, height * 0.1);
  return {
    x,
    y: startY,
    vx: rand(-4, 4),
    vy: speed,
    rotation: rand(-Math.PI, Math.PI),
    vr: rand(-0.6, 0.6),
    life: 0,
    maxLife: rand(4.5, 7),
    size: rand(width * 0.03, width * 0.05),
    opacity: 0.25,
    fade: rand(0.1, 0.2),
  };
}

export function updatePetals(petals: Petal[], dt: number, width: number, height: number): Petal[] {
  const updated: Petal[] = [];
  const friction = 0.92;
  for (const petal of petals) {
    const next = { ...petal };
    next.life += dt;
    next.x += next.vx * dt;
    next.y += next.vy * dt;
    next.vx *= friction;
    next.vy = next.vy * friction + 12 * dt;
    next.rotation += next.vr * dt;
    const lifeRatio = next.life / next.maxLife;
    if (lifeRatio > 1) continue;
    if (next.y > height + 40) continue;
    next.opacity = Math.max(0, petal.opacity * (1 - lifeRatio * petal.fade));
    updated.push(next);
  }
  return updated;
}
