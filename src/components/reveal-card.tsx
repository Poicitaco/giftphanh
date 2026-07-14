"use client";

import { useEffect } from "react";

export type Memory = {
  id: string;
  text: string;
  date: string;
  photo?: string;
  color: string;
  rotation: number;
  createdAt: number;
};

type RevealCardProps = {
  memory: Memory;
  onClose: () => void;
  onPullAnother: () => void;
  canPullAnother?: boolean;
};

const starPositions = [
  "left-[2%] top-[10%] w-5 rotate-12", "left-[9%] top-[29%] w-3 -rotate-6",
  "left-[17%] top-[7%] w-6 -rotate-12", "left-[24%] top-[46%] w-4 rotate-6",
  "left-[31%] top-[18%] w-3 rotate-12", "left-[38%] top-[74%] w-6 -rotate-6",
  "left-[45%] top-[8%] w-4 rotate-6", "left-[52%] top-[27%] w-3 -rotate-12",
  "left-[59%] top-[5%] w-5 rotate-12", "left-[66%] top-[40%] w-4 -rotate-6",
  "left-[73%] top-[16%] w-6 rotate-6", "left-[81%] top-[33%] w-3 rotate-12",
  "left-[89%] top-[9%] w-5 -rotate-12", "left-[95%] top-[51%] w-3 rotate-6",
  "left-[4%] top-[68%] w-4 -rotate-6", "left-[12%] top-[88%] w-6 rotate-12",
  "left-[21%] top-[72%] w-3 rotate-6", "left-[28%] top-[93%] w-5 -rotate-12",
  "left-[36%] top-[57%] w-4 rotate-12", "left-[44%] top-[91%] w-3 -rotate-6",
  "left-[55%] top-[68%] w-5 rotate-6", "left-[63%] top-[89%] w-4 rotate-12",
  "left-[71%] top-[62%] w-3 -rotate-12", "left-[78%] top-[84%] w-6 rotate-6",
  "left-[86%] top-[70%] w-4 -rotate-6", "left-[93%] top-[91%] w-5 rotate-12",
  "left-[48%] top-[49%] w-3 rotate-6", "left-[68%] top-[76%] w-4 -rotate-12",
];

const paperStyles: Record<string, string> = {
  sky: "bg-[#e8f1f4] bg-[url('/assets/paper-sky.png')]",
  sage: "bg-[#e5e7d9] bg-[url('/assets/paper-sage-BFR7ypYW.png')]",
  lavender: "bg-[#eeeaf4] bg-[url('/assets/paper-lavender.png')]",
};

export function RevealCard({ memory, onClose, onPullAnother, canPullAnother = true }: RevealCardProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const date = new Date(`${memory.date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="reveal-layer fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#fffaf0] bg-[radial-gradient(circle_at_20%_25%,rgba(246,220,142,.18),transparent_25%),radial-gradient(circle_at_82%_38%,rgba(229,194,212,.16),transparent_24%)] p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Memory"
    >
      <div className="reveal-stars pointer-events-none absolute inset-0" aria-hidden="true">
        {starPositions.map((position) => (
          <img
            alt=""
            className={`absolute h-auto opacity-70 ${position}`}
            key={position}
            src="/assets/star-sky.png"
          />
        ))}
      </div>

      <article
        className={`reveal-sheet ${paperStyles[memory.color] ?? "bg-[#edf0ef]"}`}
      >
        <img
          alt=""
          aria-hidden="true"
          className="reveal-tape absolute left-1/2 top-0 w-32 -translate-x-1/2"
          src="/assets/tape-cropped-DBYUXYN6.png"
        />
        <button
          aria-label="Tuck it back into the jar"
          className="reveal-close absolute right-8 top-7 p-2 text-3xl leading-none"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        {memory.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="mx-auto mb-6 max-h-52 max-w-full object-contain" src={memory.photo} alt="Memory attachment" />
        )}
        <p className="reveal-text mx-auto max-w-sm font-serif text-2xl italic leading-relaxed">“{memory.text}”</p>
        <time className="reveal-date mt-7 block font-mono text-base text-[#5f6973]" dateTime={memory.date}>
          {date}
        </time>
        <div className="reveal-actions mt-9 flex flex-wrap justify-center gap-3">
          <button className="rounded-lg bg-white/70 px-5 py-3 font-mono shadow-sm" onClick={onClose} type="button">
            tuck it back
          </button>
          <button
            className="rounded-lg bg-white/70 px-5 py-3 font-mono shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!canPullAnother}
            onClick={onPullAnother}
            type="button"
          >
            unfold another
          </button>
        </div>
      </article>
    </div>
  );
}
