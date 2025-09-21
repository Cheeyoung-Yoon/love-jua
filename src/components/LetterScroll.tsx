"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/letter.module.css";

interface LetterScrollProps {
  onEndReach: () => void;
}

export default function LetterScroll({ onEndReach }: LetterScrollProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateProgress = () => {
      const totalScrollable = stage.offsetHeight - window.innerHeight;
      const scrolled = window.scrollY - stage.offsetTop;
      const next = totalScrollable <= 0 ? 1 : Math.min(Math.max(scrolled / totalScrollable, 0), 1);
      setProgress(next);
      if (!triggeredRef.current && next > 0.985) {
        triggeredRef.current = true;
        window.scrollTo({ top: stage.offsetTop + totalScrollable, behavior: "smooth" });
        window.setTimeout(onEndReach, 200);
      }
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
    };
  }, [onEndReach]);

  const leftAngle = -8 + progress * 20;
  const rightAngle = 8 + progress * -20;

  return (
    <div className={styles.stage} ref={stageRef}>
      <aside className={`${styles.side} ${styles.left}`} style={{ transform: `rotate(${leftAngle}deg)` }} />
      <aside className={`${styles.side} ${styles.right}`} style={{ transform: `rotate(${rightAngle}deg)` }} />

      <section className={styles.letter}>
        <div className={styles.scrollCore}>
          <div className={styles.fabric} aria-hidden="true" />
          <div className={styles.band}>
            <div className={styles.bandTexture} aria-hidden="true" />
            <div className={styles.medallion} aria-hidden="true" />
            <article className={styles.message}>
              <header className={styles.header}>
                <span className={styles.headerBadge}>書</span>
                <div>
                  <h1>서신</h1>
                  <p className={styles.sub}>달빛 아래 붓을 적시어…</p>
                </div>
              </header>

              <div className={styles.body}>
                <p>
                  바람이 잔잔한 밤, 당신께 전해지는 글월 하나. 마음의 결을 따라 종이가 한 장씩 넘겨지듯, 이 편지도 천천히,
                  그러나 분명하게 닿기를 바랍니다.
                </p>
                <p>
                  … 여기에 실제 편지 내용을 길게 넣어도 좋고, 여러 문단과 삽화를 섞으며 스크롤 흐름에 맞춰 연출할 수 있어요.
                </p>
                <p>스크롤을 내릴수록 양옆의 서신 장식이 방향에 맞춰 회전하며 화면의 몰입감을 높입니다.</p>
                <p>끝까지 내리면 편지가 조용히 닫혀요.</p>
                <div className={styles.footerSpacer} />
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
