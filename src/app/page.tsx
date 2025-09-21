"use client";

import { useState } from "react";
import KnotGate from "@/components/KnotGate";
import LetterScroll from "@/components/LetterScroll";
import CloseCurtain from "@/components/CloseCurtain";
import PetalsCanvas from "@/components/PetalsCanvas";

type Stage = "closed" | "opened" | "closing" | "closed-final";

export default function Home() {
  const [stage, setStage] = useState<Stage>("closed");
  const [petalsBurst, setPetalsBurst] = useState(0);

  return (
    <main style={{ minHeight: "100vh", overflow: "hidden", position: "relative" }}>
      {stage === "closed" && (
        <KnotGate
          onUntie={() => {
            setStage("opened");
            setPetalsBurst((value) => value + 1);
          }}
        />
      )}

      {stage === "opened" && (
        <>
          <PetalsCanvas burstKey={petalsBurst} />
          <LetterScroll
            onEndReach={() => {
              setStage("closing");
            }}
          />
        </>
      )}

      {stage === "closing" && <CloseCurtain onClosed={() => setStage("closed-final")} />}

      {stage === "closed-final" && (
        <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
          <button
            onClick={() => {
              setStage("closed");
            }}
            style={{ padding: "12px 18px", border: "1px solid #000", background: "#fff", cursor: "pointer" }}
          >
            다시 열기
          </button>
        </div>
      )}
    </main>
  );
}
