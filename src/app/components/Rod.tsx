"use client";

import { motion, MotionValue } from "framer-motion";

interface RodProps {
  side: "left" | "right";
  rotation: MotionValue<number>;
}

const Rod = ({ side, rotation }: RodProps) => {
  const originClass = side === "left" ? "origin-left" : "origin-right";
  return (
    <motion.div
      aria-hidden
      className={`relative flex w-16 sm:w-20 items-center justify-center ${originClass}`}
      style={{ rotate: rotation }}
    >
      <div className="absolute inset-y-6 flex w-6 items-center justify-center overflow-visible">
        <span
          className="block h-full w-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #3b2a17, #9b7b3d 45%, #3b2a17)",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.35)",
          }}
        />
      </div>
      <div
        className="h-24 w-24 overflow-hidden rounded-full border border-[#caa84f]/60 shadow-[0_10px_20px_rgba(0,0,0,0.35)]"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255, 224, 189, 0.35), transparent 60%)," +
            "radial-gradient(circle at 70% 65%, rgba(0, 0, 0, 0.45), transparent 65%)," +
            "linear-gradient(135deg, #5b3717, #2c1505 55%, #5b3717)",
        }}
      />
    </motion.div>
  );
};

export default Rod;
