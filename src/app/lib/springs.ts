export const UNTIE_THRESHOLD = 120;
export const OPEN_DURATION = 1.2;
export const CLOSE_DURATION = 1.0;
export const REKNOT_DURATION = 0.6;
export const ROD_OPEN_ANGLE = 220;
export const ROD_SCROLL_ROTATIONS = 360 * 1.2;

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function waveOffset(progress: number) {
  return Math.sin(progress * Math.PI * 4) * 3;
}
