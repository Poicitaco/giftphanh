"use client";

import { useState } from "react";
import { openMemory, type OpenedMemory } from "@/app/j/[slug]/actions";

export type Star = { id: string; color: string; rotation: number; opened: boolean };

export function RecipientJar({ slug, recipientName, stars }: { slug: string; recipientName: string; stars: Star[] }) {
  const [letter, setLetter] = useState<OpenedMemory | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function unfold(id: string) {
    setBusy(id); setError("");
    const result = await openMemory(slug, id);
    setBusy(null);
    if (result.memory) setLetter(result.memory); else setError(result.error || "could not open this star");
  }
  return <main className="recipient-jar-page scene">
    <header><p>made with love for</p><h1>{recipientName}</h1><p>{stars.length ? "tap a star to unfold a letter." : "the jar is open, but no approved stars are waiting yet."}</p></header>
    <section className="recipient-jar" aria-label={`${stars.length} letters`}>
      <div className="jar-paper-backdrop" aria-hidden="true" />
      <img className="recipient-jar-glass" src="/assets/mason-jar.png" alt="A glass jar filled with paper stars" />
      <div className="recipient-stars">
        {stars.map((star, index) => <button aria-label={`Open star ${index + 1}`} className={`recipient-star ${star.opened ? "is-opened" : ""}`} disabled={busy === star.id} key={star.id} onClick={() => unfold(star.id)} style={{ left: `${20 + ((index * 29) % 60)}%`, bottom: `${8 + ((index * 19) % 53)}%`, transform: `rotate(${star.rotation}deg)` }}><img src={`/assets/star-${star.color}.png`} alt="" /></button>)}
      </div>
    </section>
    {error && <p className="form-error">{error}</p>}
    {letter && <div className="reveal-layer" role="dialog" aria-modal="true"><article className={`reveal-sheet memory-card-${letter.color}`}><span className="reveal-tape" /><button className="reveal-close" onClick={() => setLetter(null)} aria-label="Close">×</button><p className="reveal-text">“{letter.content}”</p><p className="letter-signature">— {letter.is_anonymous ? "anonymous" : letter.sender_name}</p><time className="reveal-date">{new Date(letter.created_at).toLocaleDateString()}</time><div className="reveal-actions"><button onClick={() => setLetter(null)}>tuck it back</button></div></article></div>}
  </main>;
}
