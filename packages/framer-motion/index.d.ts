import type { ReactElement, ReactNode, RefAttributes } from "react";

declare class MotionValue<T = unknown> {
  constructor(initial: T);
  get(): T;
  set(next: T): void;
  onChange(subscriber: (value: T) => void): () => void;
}

export declare function useMotionValue<T = unknown>(initial: T): MotionValue<T>;
export declare function useTransform<T, R>(source: MotionValue<T>, transformer: (value: T) => R): MotionValue<R>;
export declare function animate<T>(value: MotionValue<T>, to: T, options?: { duration?: number; ease?: string | ((value: number) => number); }): Promise<{ stop: () => void }>;

type MotionStyle = Record<string, MotionValue<unknown> | string | number | undefined>;

type MotionProps = {
  style?: MotionStyle;
  children?: ReactNode;
  className?: string;
  onClick?: (event: unknown) => void;
  onPointerDown?: (event: unknown) => void;
  role?: string;
  tabIndex?: number;
  id?: string;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
  "aria-live"?: string;
} & Record<string, unknown>;

type MotionComponent<E extends HTMLElement> = (props: MotionProps & RefAttributes<E>) => ReactElement | null;

declare const motion: Record<string, MotionComponent<HTMLElement>>;

export { motion, MotionValue };

export declare function useScroll(options?: { container?: { current: HTMLElement | null } }): { scrollYProgress: MotionValue<number> };
export declare function useMotionValueEvent<T>(value: MotionValue<T>, event: "change", callback: (value: T) => void): void;
export declare function useAnimationFrame(callback: (time: number) => void): void;
