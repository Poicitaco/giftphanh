"use client";

import { useState } from "react";
import Link from "next/link";
import { openMemory, type OpenedMemory } from "@/app/j/[slug]/actions";
import { AmbientStarField } from "@/components/ambient-star-field";
import { useSiteCopy } from "@/components/site-copy-provider";

export type Star = { id: string; color: string; rotation: number; opened: boolean; is_locked: boolean; password_hint: string | null };

export function RecipientJar({ slug, recipientName, stars }: { slug: string; recipientName: string; stars: Star[] }) {
  const copy = useSiteCopy();
  const [letter, setLetter] = useState<OpenedMemory | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [passwordPrompt, setPasswordPrompt] = useState<{ id: string; hint: string | null } | null>(null);
  const [starPassword, setStarPassword] = useState("");

  async function unfold(id: string, password?: string) {
    setBusy(id);
    setError("");
    const result = await openMemory(slug, id, password);
    setBusy(null);
    if (result.memory) {
      setLetter(result.memory);
      setPasswordPrompt(null);
      setStarPassword("");
    } else {
      setError(result.error || copy.error_star_open);
    }
  }

  function handleStarClick(star: Star) {
    if (star.is_locked && !star.opened) {
      setPasswordPrompt({ id: star.id, hint: star.password_hint });
    } else {
      unfold(star.id);
    }
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordPrompt) {
      unfold(passwordPrompt.id, starPassword);
    }
  }

  return (
    <main className="recipient-jar-page scene">
      <AmbientStarField full />

      <header>
        <p>{copy.recipient_made_for}</p>
        <h1>{recipientName}</h1>
        <p>{stars.length ? copy.recipient_tap_star : copy.recipient_empty}</p>
        {stars.length > 0 && (
          <Link href={`/gift/all`} className="view-all-link">
            {copy.recipient_view_all}
          </Link>
        )}
      </header>

      <section className={`recipient-jar ${busy ? "is-pulling" : ""}`} aria-label={`${stars.length} lá thư`}>
        <div className="jar-paper-backdrop" aria-hidden="true" />
        <img className="recipient-jar-glass" src="/assets/mason-jar.png" alt={copy.recipient_jar_alt} />
        <div className="recipient-stars">
          {stars.map((star, index) => (
            <button
              aria-label={`${copy.recipient_open_star} ${index + 1}`}
              className={`recipient-star ${star.opened ? "is-opened" : ""} ${busy === star.id ? "is-selected" : ""}`}
              disabled={Boolean(busy)}
              key={star.id}
              onClick={() => handleStarClick(star)}
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
        <div className="reveal-layer" role="dialog" aria-modal="true" aria-label={copy.recipient_dialog_label}>
          <article className={`reveal-sheet memory-card-${letter.color}`}>
            <span className="reveal-tape" />
            <button className="reveal-close" onClick={() => setLetter(null)} aria-label={copy.recipient_close}>×</button>
            <p className={`reveal-text letter-font-${letter.font_key}`}>“{letter.content}”</p>
            <p className="letter-signature">— {letter.is_anonymous ? copy.recipient_anonymous : letter.sender_name}</p>
            <time className="reveal-date">{new Date(letter.created_at).toLocaleDateString("vi-VN")}</time>
            <div className="reveal-actions"><button onClick={() => setLetter(null)}>{copy.recipient_fold_back}</button></div>
          </article>
        </div>
      )}
      
      {passwordPrompt && (
        <div className="reveal-layer" role="dialog" aria-modal="true">
          <form onSubmit={submitPassword} className="flow-paper" style={{ position: "relative", zIndex: 10, maxWidth: "400px", padding: "2rem" }}>
            <button type="button" className="reveal-close" onClick={() => setPasswordPrompt(null)} aria-label="Đóng" style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            <h2 style={{ marginBottom: "1rem" }}>Ngôi sao bị khóa 🔒</h2>
            {passwordPrompt.hint && <p style={{ marginBottom: "1rem", fontStyle: "italic" }}>Gợi ý: {passwordPrompt.hint}</p>}
            <input 
              type="text" 
              placeholder="Nhập mật khẩu..." 
              value={starPassword} 
              onChange={(e) => setStarPassword(e.target.value)} 
              required 
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1rem", border: "2px solid var(--border)", borderRadius: "8px" }}
            />
            {error && <p className="form-error" style={{ marginBottom: "1rem" }}>{error}</p>}
            <button className="paper-button" type="submit" disabled={Boolean(busy)} style={{ width: "100%" }}>
              {busy ? "Đang mở..." : "Mở khóa"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
