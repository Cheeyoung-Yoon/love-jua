"use client";

import { useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remark from "remark";
import { useScroll } from "framer-motion";
import CloseHint from "./CloseHint";

interface LetterBodyProps {
  isActive: boolean;
  onProgress: (value: number) => void;
  onContentHeight: (height: number) => void;
  focusToken: number;
}

type MarkdownElementProps = {
  children?: ReactNode;
  [key: string]: unknown;
};

const components: Record<string, (props: MarkdownElementProps) => ReactElement> = {
  h1: (props) => (
    <h1
      {...props}
      className="mb-6 text-center text-3xl font-semibold tracking-[0.08em] text-[#a87d1d] drop-shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
    />
  ),
  p: (props) => <p {...props} className="mb-4 leading-relaxed" />,
  ul: (props) => <ul {...props} className="mb-4 space-y-2" />,
  li: (props) => (
    <li
      {...props}
      className="relative pl-5 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-[#caa84f]"
    />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className="my-6 border-l-4 border-[#caa84f]/70 bg-white/40 px-5 py-3 italic text-[#7a5f1f] shadow-inner"
    />
  ),
  strong: (props) => <strong {...props} className="font-semibold text-[#8a152d]" />,
  em: (props) => <em {...props} className="text-[#6a5330]" />,
  code: (props) => (
    <code
      {...props}
      className="rounded bg-[#f0ead7] px-1 py-0.5 text-sm text-[#403218] shadow-inner"
    />
  ),
};

const LetterBody = ({ isActive, onProgress, onContentHeight, focusToken }: LetterBodyProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string>("");
  const { scrollYProgress } = useScroll({ container: containerRef });

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange(onProgress);
    return unsubscribe;
  }, [scrollYProgress, onProgress]);

  useEffect(() => {
    let mounted = true;
    fetch("/assets/sample-letter.md")
      .then((res) => res.text())
      .then((text) => remark().process(text))
      .then((file) => {
        if (!mounted) return;
        setContent(String(file.value));
      })
      .catch(() => {
        if (mounted) {
          setContent("소중한 마음을 전하는 편지를 불러오지 못했습니다.");
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const update = () => {
      onContentHeight(node.scrollHeight);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [onContentHeight]);

  useEffect(() => {
    if (isActive && focusToken) {
      containerRef.current?.focus();
    }
  }, [focusToken, isActive]);

  const rendered = useMemo(() => content, [content]);

  return (
    <div className="relative flex flex-col">
      <div
        ref={containerRef}
        tabIndex={isActive ? 0 : -1}
        className={`scrollbar-gold relative max-h-[70vh] overflow-y-auto px-6 py-8 text-base text-[var(--ink)] outline-none transition-shadow duration-300 ${
          isActive ? "shadow-[inset_0_0_18px_rgba(0,0,0,0.2)]" : "pointer-events-none blur-[1px]"
        }`}
        aria-label="편지 내용"
      >
        <ReactMarkdown components={components}>{rendered}</ReactMarkdown>
      </div>
      <CloseHint visible={isActive} />
    </div>
  );
};

export default LetterBody;
