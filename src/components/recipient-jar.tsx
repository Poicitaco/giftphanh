"use client";

import { useState } from "react";
import { openMemory, type OpenedMemory } from "@/app/j/[slug]/actions";

export type Star = { id: string; color: string; rotation: number; opened: boolean };

const ambientStars = [
  [7, 18, 22], [16, 70, 34], [28, 12, 18], [39, 82, 26], [51, 20, 16],
  [63, 74, 24], [75, 10, 30], [86, 58, 18], [94, 28, 27], [91, 86, 16],
];

export function RecipientJar({ slug, recipientName, stars }: { slug: string; recipientName: string; stars: Star[] }) {
  const [letter, setLetter] = useState<OpenedMemory | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function unfold(id: string) {
    setBusy(id);
    setError("");
    const result = await openMemory(slug, id);
    setBusy(null);
    if (result.memory) setLetter(result.memory);
    else setError(result.error || "Không thể mở ngôi sao này.");
  }

  return (
    <main className="recipient-jar-page scene">
      <div className="recipient-ambient-stars" aria-hidden="true">
        {ambientStars.map(([left, top, size], index) => (
          <img key={`${left}-${top}`} src={`/assets/star-${index % 2 ? "lavender" : "sky"}.png`} alt="" style={{ left: `${left}%`, top: `${top}%`, width: `${size}px`, animationDelay: `${index * -0.35}s` }} />
        ))}
      </div>

      <header><p>made with love for</p><h1>{recipientName}</h1><p>{stars.length ? "chạm vào từng ngôi sao để mở một lá thư." : "chiếc lọ đã mở nhưng chưa có thư nào được duyệt."}</p></header>

      <section className={`recipient-jar ${busy ? "is-pulling" : ""}`} aria-label={`${stars.length} lá thư`}>
        <div className="jar-paper-backdrop" aria-hidden="true" />
        <img className="recipient-jar-glass" src="/assets/mason-jar.png" alt="Một chiếc lọ thủy tinh chứa những ngôi sao giấy" />
        <div className="recipient-stars">
          {stars.map((star, index) => (
            <button
              aria-label={`Mở ngôi sao ${index + 1}`}
              className={`recipient-star ${star.opened ? "is-opened" : ""} ${busy === star.id ? "is-selected" : ""}`}
              disabled={Boolean(busy)}
              key={star.id}
              onClick={() => unfold(star.id)}
              style={{
                left: `${18 + ((index * 29) % 62)}%`,
                bottom: `${7 + ((index * 19) % 50)}%`,
                "--star-rotation": `${star.rotation}deg`,
                "--star-delay": `${(index % 7) * -0.23}s`,
              } as React.CSSProperties}
            >
              <img src={`/assets/star-${star.color}.png`} alt="" />
            </button>
          ))}
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}
      {letter && (
        <div className="reveal-layer" role="dialog" aria-modal="true" aria-label="Lá thư đã mở">
          <article className={`reveal-sheet memory-card-${letter.color}`}>
            <span className="reveal-tape" />
            <button className="reveal-close" onClick={() => setLetter(null)} aria-label="Đóng">×</button>
            <p className="reveal-text">“{letter.content}”</p>
            <p className="letter-signature">— {letter.is_anonymous ? "ẩn danh" : letter.sender_name}</p>
            <time className="reveal-date">{new Date(letter.created_at).toLocaleDateString("vi-VN")}</time>
            <div className="reveal-actions"><button onClick={() => setLetter(null)}>gấp lại vào lọ</button></div>
          </article>
        </div>
      )}
    </main>
  );
}
