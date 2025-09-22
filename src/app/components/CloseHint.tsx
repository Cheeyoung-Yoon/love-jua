"use client";

interface CloseHintProps {
  visible: boolean;
}

const CloseHint = ({ visible }: CloseHintProps) => {
  return (
    <div
      aria-hidden
      className={`pointer-events-none mt-10 flex justify-center text-sm transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="rounded-full border border-[#caa84f]/70 bg-[#fef8ea]/70 px-4 py-1 text-[#7a5f1f] shadow-sm">
        끝까지 읽으면 두루마리가 스스로 닫혀요
      </span>
    </div>
  );
};

export default CloseHint;
