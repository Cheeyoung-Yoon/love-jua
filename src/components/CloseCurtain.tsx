"use client";

import { useEffect, useState } from "react";

interface CloseCurtainProps {
  onClosed: () => void;
}

export default function CloseCurtain({ onClosed }: CloseCurtainProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setActive(true));
    const timer = window.setTimeout(onClosed, 900);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [onClosed]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "rgba(20,16,15,0.08)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: "min(820px, 86vw)",
          height: "70vh",
          background: "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(244,235,214,0.92) 100%)",
          border: "1px solid rgba(214,177,98,0.45)",
          boxShadow:
            "0 40px 120px rgba(20,16,15,0.32), inset 0 0 45px rgba(255,248,224,0.38), inset 0 0 0 8px rgba(214,177,98,0.18)",
          transform: `scaleY(${active ? 1 : 0.1})`,
          opacity: active ? 1 : 0,
          borderRadius: "18px",
          transition: "transform 0.6s cubic-bezier(0.2,0.8,0.2,1), opacity 0.6s ease",
          transformOrigin: "center",
        }}
      />
    </div>
  );
}
