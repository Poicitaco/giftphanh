"use client";

import Link from "next/link";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { RevealCard, type Memory } from "./reveal-card";

const STORAGE_KEY = "memory-jar:memories:v1";

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

function readMemories(): Memory[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter(
      (memory): memory is Memory =>
        typeof memory === "object" &&
        memory !== null &&
        typeof memory.id === "string" &&
        typeof memory.text === "string" &&
        typeof memory.date === "string" &&
        typeof memory.color === "string" &&
        typeof memory.rotation === "number" &&
        typeof memory.createdAt === "number" &&
        (memory.photo === undefined || typeof memory.photo === "string"),
    );
  } catch {
    return [];
  }
}

export function MemoriesGallery() {
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [date, setDate] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState<Memory | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Memory | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => setMemories(readMemories()));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent | globalThis.KeyboardEvent) => {
      if (
        (event instanceof globalThis.KeyboardEvent && event.key === "Escape") ||
        (event instanceof MouseEvent && !filterRef.current?.contains(event.target as Node))
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menuOpen]);

  const dates = useMemo(
    () => [...new Set((memories ?? []).map((memory) => memory.date))].sort(),
    [memories],
  );
  const allMemories = memories ?? [];
  const filtered = date ? allMemories.filter((memory) => memory.date === date) : allMemories;

  function chooseDate(nextDate: string) {
    setDate(nextDate);
    setMenuOpen(false);
  }

  function openWithKeyboard(event: KeyboardEvent<HTMLDivElement>, memory: Memory) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(memory);
    }
  }

  function removeMemory() {
    if (!pendingDelete) return;
    const next = allMemories.filter((memory) => memory.id !== pendingDelete.id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setMemories(next);
      if (open?.id === pendingDelete.id) setOpen(null);
      setPendingDelete(null);
    } catch {
      return;
    }
  }

  function pullAnother() {
    if (!open || filtered.length < 2) return;
    const index = filtered.findIndex((memory) => memory.id === open.id);
    setOpen(filtered[(index + 1) % filtered.length]);
  }

  return (
    <main className="memories-page">
      <div className="memories-shell">
        <Link className="composer-back" href="/">
          <span aria-hidden="true">←</span> back
        </Link>

        <header className="memories-header">
          <div>
            <h1>your paper stars</h1>
            <p>{allMemories.length ? `${allMemories.length} folded and kept.` : "no stars folded yet."}</p>
          </div>

          <div className="date-filter" ref={filterRef}>
            <span>filter by date</span>
            <button
              aria-expanded={menuOpen}
              aria-haspopup="listbox"
              aria-label="Filter memories by date"
              onClick={() => setMenuOpen((value) => !value)}
              type="button"
            >
              {date ? formatDate(date) : "all dates"}
            </button>
            {menuOpen && (
              <div className="date-filter-menu" role="listbox" aria-label="Memory dates">
                <button aria-selected={!date} onClick={() => chooseDate("")} role="option" type="button">
                  all dates
                </button>
                {dates.map((memoryDate) => (
                  <button
                    aria-selected={date === memoryDate}
                    key={memoryDate}
                    onClick={() => chooseDate(memoryDate)}
                    role="option"
                    type="button"
                  >
                    {formatDate(memoryDate)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <section className="memory-grid" aria-label="Saved memories">
          {filtered.map((memory) => (
            <div
              aria-label={`${memory.text}, ${formatDate(memory.date)}`}
              className={`memory-card memory-card-${memory.color}`}
              key={memory.id}
              onClick={() => setOpen(memory)}
              onKeyDown={(event) => openWithKeyboard(event, memory)}
              role="button"
              tabIndex={0}
            >
              <button
                aria-label="let this star go"
                className="memory-delete"
                onClick={(event) => {
                  event.stopPropagation();
                  setPendingDelete(memory);
                }}
                type="button"
              >
                ×
              </button>
              {/* Local decorative sprites do not need image optimization. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" aria-hidden="true" src={`/assets/star-${memory.color}.png`} />
              <p>{memory.text}</p>
              <time dateTime={memory.date}>{formatDate(memory.date)}</time>
            </div>
          ))}
        </section>
      </div>

      {open && (
        <RevealCard
          memory={open}
          onClose={() => setOpen(null)}
          onPullAnother={pullAnother}
          canPullAnother={filtered.length > 1}
        />
      )}

      {pendingDelete && (
        <div className="delete-layer" role="presentation" onClick={() => setPendingDelete(null)}>
          <section
            aria-labelledby="delete-title"
            aria-modal="true"
            className="delete-sheet"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h2 id="delete-title">let this star go?</h2>
            <p>this memory will drift out of your little jar for good.</p>
            <div>
              <button onClick={() => setPendingDelete(null)} type="button">keep it</button>
              <button onClick={removeMemory} type="button">let go</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
