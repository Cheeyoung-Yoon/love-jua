import {
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

const raf = typeof window !== "undefined" ? window.requestAnimationFrame : () => 0;
const caf = typeof window !== "undefined" ? window.cancelAnimationFrame : () => {};

class MotionValue {
  constructor(initial) {
    this.value = initial;
    this.subscribers = new Set();
  }

  get() {
    return this.value;
  }

  set(next) {
    if (this.value === next) return;
    this.value = next;
    this.subscribers.forEach((fn) => fn(next));
  }

  onChange(subscriber) {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }
}

export function useMotionValue(initial) {
  const ref = useRef();
  if (!ref.current) {
    ref.current = new MotionValue(initial);
  }
  return ref.current;
}

export function useTransform(source, transformer) {
  const derived = useMotionValue(transformer(source.get()));
  useEffect(() => {
    const unsubscribe = source.onChange((value) => {
      derived.set(transformer(value));
    });
    return unsubscribe;
  }, [source, transformer, derived]);
  return derived;
}

function easeFunction(ease) {
  if (typeof ease === "function") return ease;
  switch (ease) {
    case "easeInOut":
      return (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    case "easeOut":
      return (t) => 1 - Math.pow(1 - t, 3);
    case "easeIn":
      return (t) => t * t;
    default:
      return (t) => t;
  }
}

export function animate(value, to, options = {}) {
  const from = value.get();
  const { duration = 0.8, ease = "easeInOut" } = options;
  const easing = easeFunction(ease);
  const total = Math.max(0.001, duration * 1000);
  let frame = null;
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();

  return new Promise((resolve) => {
    const loop = (now) => {
      const current = now ?? (typeof performance !== "undefined" ? performance.now() : Date.now());
      const elapsed = current - start;
      const t = Math.min(1, elapsed / total);
      const eased = easing(t);
      const next = typeof from === "number" && typeof to === "number" ? from + (to - from) * eased : eased >= 1 ? to : from;
      value.set(next);
      if (t < 1) {
        frame = raf(loop);
      } else {
        resolve({ stop: () => caf(frame) });
      }
    };
    frame = raf(loop);
  });
}

function formatStyleValue(key, value) {
  if (value == null) return value;
  if (typeof value === "number" && !["opacity", "zIndex", "flex", "fontWeight"].includes(key)) {
    return `${value}`;
  }
  return value;
}

function useMergedRef(forwardedRef) {
  const localRef = useRef(null);
  useImperativeHandle(forwardedRef, () => localRef.current);
  return localRef;
}

function MotionComponent(tag) {
  const Component = forwardRef((props, ref) => {
    const { style, children, ...rest } = props;
    const nodeRef = useMergedRef(ref);
    const [staticStyle, dynamicEntries] = useMemo(() => {
      const nextStatic = {};
      const motionEntries = [];
      if (style) {
        Object.entries(style).forEach(([key, value]) => {
          if (value && typeof value === "object" && typeof value.get === "function") {
            motionEntries.push([key, value]);
          } else if (value != null) {
            nextStatic[key] = value;
          }
        });
      }
      return [nextStatic, motionEntries];
    }, [style]);

    useEffect(() => {
      const node = nodeRef.current;
      if (!node) return undefined;
      Object.entries(staticStyle).forEach(([key, value]) => {
        node.style[key] = formatStyleValue(key, value);
      });
      const unsubscribers = dynamicEntries.map(([key, motionValue]) => {
        const mv = motionValue;
        const apply = (next) => {
          node.style[key] = formatStyleValue(key, next);
        };
        apply(mv.get());
        return mv.onChange(apply);
      });
      return () => {
        unsubscribers.forEach((fn) => fn());
      };
    }, [staticStyle, dynamicEntries, nodeRef]);

    return createElement(tag, { ...rest, ref: nodeRef }, children);
  });
  Component.displayName = `motion.${String(tag)}`;
  return Component;
}

const motionProxy = new Proxy(
  {},
  {
    get: (_, tag) => MotionComponent(tag),
  }
);

export const motion = motionProxy;

export function useScroll({ container } = {}) {
  const progress = useMotionValue(0);
  useEffect(() => {
    const node = container?.current ?? null;
    if (!node) return undefined;
    const update = () => {
      const max = node.scrollHeight - node.clientHeight;
      if (max <= 0) {
        progress.set(0);
        return;
      }
      progress.set(node.scrollTop / max);
    };
    update();
    node.addEventListener("scroll", update, { passive: true });
    return () => node.removeEventListener("scroll", update);
  }, [container, progress]);
  return { scrollYProgress: progress };
}

export function useMotionValueEvent(value, event, callback) {
  useEffect(() => {
    if (event !== "change") return undefined;
    return value.onChange(callback);
  }, [value, event, callback]);
}

export function useAnimationFrame(callback) {
  useEffect(() => {
    let frameId;
    let active = true;
    const loop = (time) => {
      if (!active) return;
      callback(time);
      frameId = raf(loop);
    };
    frameId = raf(loop);
    return () => {
      active = false;
      caf(frameId);
    };
  }, [callback]);
}

export { MotionValue };
