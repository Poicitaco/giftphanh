"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RevealCard } from "./reveal-card";
import { WelcomeScene } from "./welcome-scene";

export type Memory = {
  id: string;
  text: string;
  date: string;
  photo?: string;
  color: string;
  rotation: number;
  createdAt: number;
};

const STORAGE_KEY = "memory-jar:memories:v1";
const burstPositions = [
  "-translate-x-28 -translate-y-20 -rotate-12", "-translate-x-20 -translate-y-36 rotate-12",
  "-translate-x-8 -translate-y-44 -rotate-6", "translate-x-10 -translate-y-48 rotate-12",
  "translate-x-24 -translate-y-40 -rotate-12", "translate-x-32 -translate-y-24 rotate-6",
  "-translate-x-36 -translate-y-28 rotate-12", "translate-x-4 -translate-y-32 -rotate-12",
];

function isMemory(value: unknown): value is Memory {
  if (!value || typeof value !== "object") return false;
  const memory = value as Partial<Memory>;
  return typeof memory.id === "string" && typeof memory.text === "string" &&
    typeof memory.date === "string" && typeof memory.color === "string" &&
    typeof memory.rotation === "number" && typeof memory.createdAt === "number" &&
    (memory.photo === undefined || typeof memory.photo === "string");
}

export function MemoryJar() {
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [open, setOpen] = useState<Memory | null>(null);
  const [pulling, setPulling] = useState<Memory | null>(null);
  const previousId = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      queueMicrotask(() => setMemories(Array.isArray(parsed) ? parsed.filter(isMemory) : []));
    } catch {
      queueMicrotask(() => setMemories([]));
    }
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  function pullStar() {
    if (!memories?.length || pulling) return;
    const choices = memories.length > 1 ? memories.filter(({ id }) => id !== previousId.current) : memories;
    const memory = choices[Math.floor(Math.random() * choices.length)];
    previousId.current = memory.id;
    setOpen(null);
    setPulling(memory);
    timer.current = setTimeout(() => {
      setPulling(null);
      setOpen(memory);
    }, 700);
  }

  if (memories === null) return <main className="scene" />;
  if (memories.length === 0) return <WelcomeScene />;

  return (
    <main className="jar-page-clone scene relative flex min-h-dvh flex-col items-center overflow-hidden bg-[radial-gradient(circle_at_20%_15%,rgba(244,217,120,.14),transparent_30%),radial-gradient(circle_at_85%_35%,rgba(225,193,217,.13),transparent_30%),#fff8ed] px-4 pt-36 sm:pt-28">
      <nav className="jar-menu absolute right-3 top-4 z-20 flex flex-col items-end gap-2 sm:right-7" aria-label="jar menu">
        <Link className="jar-menu-strip jar-menu-strip-add rotate-[-2deg] bg-[#d2aa68] px-4 py-2 text-sm text-[#543f30] shadow-sm" href="/add" aria-label="add a star">+ add a star</Link>
        <Link className="jar-menu-strip jar-menu-strip-all rotate-[1deg] bg-[#d2aa68] px-4 py-2 text-sm text-[#543f30] shadow-sm" href="/memories">★ view all stars</Link>
        <Link className="jar-menu-strip jar-menu-strip-signup rotate-[-1deg] bg-[#d2aa68] px-4 py-2 text-sm text-[#543f30] shadow-sm" href="/sign-up">✉ sign up</Link>
      </nav>

      <header className="relative z-10 text-center">
        <h1 className="font-['Cormorant_Garamond',serif] text-4xl font-normal text-[#2c6bb3]">tap the jar</h1>
        <p className="mt-4 text-sm text-black">{memories.length === 1 ? "one paper star waits inside." : `${memories.length} paper stars wait inside.`}</p>
      </header>

      <section className="jar-stage" aria-label="memory jar">
        <div className="jar-paper-backdrop" aria-hidden="true" />
        <button className="mason-jar-button focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c6bb3]" onClick={pullStar} aria-label="tap the jar to open">
          <img className="absolute inset-0 z-10 h-full w-full object-contain" src="/assets/mason-jar.png" alt="A glass mason jar filled with paper stars" />
          <span className="absolute inset-x-[22%] bottom-[10%] top-[24%] z-0 overflow-hidden">
            {memories.map((memory, index) => (
              <img
                key={memory.id}
                className="jar-memory-star absolute h-auto w-12 object-contain sm:w-16"
                style={{
                  left: `${24 + ((index * 23) % 52)}%`,
                  bottom: `${8 + ((index * 17) % 30)}%`,
                  transform: `translateX(-50%) rotate(${memory.rotation}deg)`,
                }}
                src={`/assets/star-${memory.color}.png`}
                alt=""
              />
            ))}
          </span>
          {pulling && (
            <span className="jar-burst absolute left-1/2 top-[38%] z-20" aria-hidden="true">
              {burstPositions.map((position) => <img key={position} className={`jar-burst-fragment absolute w-10 animate-pulse transition-transform duration-700 sm:w-14 ${position}`} src={`/assets/star-${pulling.color}.png`} alt="" />)}
            </span>
          )}
        </button>
      </section>

      {open && <RevealCard memory={open} onClose={() => setOpen(null)} onPullAnother={pullStar} />}
    </main>
  );
}
