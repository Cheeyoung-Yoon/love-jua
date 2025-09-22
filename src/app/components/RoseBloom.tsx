"use client";

import { useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

interface RoseBloomProps {
  active: boolean;
}

const RoseBloom = ({ active }: RoseBloomProps) => {
  const scale = useMotionValue(0.6);
  const opacity = useMotionValue(0);

  useEffect(() => {
    if (active) {
      scale.set(0.6);
      opacity.set(0);
      animate(scale, 1.1, { duration: 0.8, ease: "easeOut" }).then(() => {
        animate(scale, 1, { duration: 0.5, ease: "easeInOut" });
      });
      animate(opacity, 1, { duration: 0.6, ease: "easeOut" }).then(() => {
        animate(opacity, 0.25, { duration: 0.8, ease: "easeInOut" });
      });
    } else {
      animate(opacity, 0, { duration: 0.4, ease: "easeInOut" });
    }
  }, [active, scale, opacity]);

  return (
    <motion.div
      aria-hidden
      className="rose-bloom pointer-events-none select-none"
      style={{
        opacity,
        scale,
      }}
    />
  );
};

export default RoseBloom;
