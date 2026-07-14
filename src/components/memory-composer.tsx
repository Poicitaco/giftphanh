"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

const colors = [
  "mint",
  "lavender",
  "sky",
  "sage",
  "pink",
  "peach",
  "coral",
  "yellow",
] as const;

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export function MemoryComposer() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [date, setDate] = useState(today);
  const [photo, setPhoto] = useState<string>();
  const [error, setError] = useState("");

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === "string" ? reader.result : undefined);
    reader.onerror = () => setError("that picture could not be read. please try another one.");
    reader.readAsDataURL(file);
  }

  function submitMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      const saved = localStorage.getItem("memory-jar:memories:v1");
      let memories: unknown[] = [];

      if (saved) {
        try {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed)) memories = parsed;
        } catch {
          memories = [];
        }
      }

      memories.push({
        id: crypto.randomUUID(),
        text: trimmed,
        date,
        ...(photo ? { photo } : {}),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.floor(Math.random() * 17) - 8,
        createdAt: Date.now(),
      });

      localStorage.setItem("memory-jar:memories:v1", JSON.stringify(memories));
      localStorage.setItem("memory-jar:onboarded:v1", "true");
      router.push("/");
    } catch {
      setError("your browser could not save this memory. try a smaller picture.");
    }
  }

  return (
    <main className="composer-page">
      <Link className="composer-back" href="/">
        <span aria-hidden="true">←</span> back
      </Link>

      <header className="composer-header">
        <h1>add a memory</h1>
        <p>If you come at four in the afternoon, I&apos;ll begin to be happy by three.</p>
      </header>

      <form className="composer-form" onSubmit={submitMemory}>
        <section className="composer-paper">
          <span className="composer-tape" aria-hidden="true" />
          <textarea
            aria-label="Memory"
            maxLength={300}
            onChange={(event) => setText(event.target.value)}
            placeholder="the small thing worth remembering today…"
            rows={6}
            value={text}
          />

          {photo && (
            <div className="composer-preview">
              {/* A data URL is intentionally used because this memory stays local. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Selected memory" src={photo} />
              <button type="button" onClick={() => setPhoto(undefined)}>
                remove
              </button>
            </div>
          )}

          <div className="composer-meta">
            <input
              aria-label="Memory date"
              max="9999-12-31"
              onChange={(event) => setDate(event.target.value)}
              required
              type="date"
              value={date}
            />
            <span aria-live="polite">{text.length}/300</span>
          </div>

          <label className="composer-photo-button">
            <span aria-hidden="true">▣</span> add a picture
            <input accept="image/*" onChange={selectPhoto} type="file" />
          </label>
        </section>

        {error && (
          <p className="composer-error" role="alert">
            {error}
          </p>
        )}

        <button className="composer-submit" disabled={!text.trim()} type="submit">
          <img alt="" aria-hidden="true" src="/assets/star-mint.png" />
          drop it in the jar
        </button>
      </form>
    </main>
  );
}
