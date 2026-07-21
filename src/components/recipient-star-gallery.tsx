"use client";

import Link from "next/link";
import { AmbientStarField } from "@/components/ambient-star-field";
import { useSiteCopy } from "@/components/site-copy-provider";

export type GalleryStar = {
  id: string;
  color: string;
  sender_name: string | null;
  is_anonymous: boolean;
  content: string | null;
  font_key: string | null;
  created_at: string | null;
  opened: boolean;
};

export function RecipientStarGallery({ slug, recipientName, stars }: { slug: string; recipientName: string; stars: GalleryStar[] }) {
  const copy = useSiteCopy();

  return (
    <main className="gallery-page scene">
      <AmbientStarField />
      
      <header className="gallery-header">
        <Link className="composer-back" href={`/j/${slug}`}>← {copy.auth_back}</Link>
        <div className="flow-heading">
          <p>{copy.recipient_made_for} {recipientName}</p>
          <h1>{copy.recipient_gallery_title}</h1>
          <p>{copy.recipient_gallery_intro}</p>
        </div>
      </header>

      <section className="gallery-grid recipient-gallery-grid">
        {stars.length === 0 && <p className="gallery-empty">{copy.recipient_empty}</p>}
        {stars.map((star) => (
          <article key={star.id} className="gallery-item">
            <span className="gallery-tape" />
            <div className={`gallery-card ${star.opened ? `memory-card-${star.color}` : "is-unopened"}`}>
              {star.opened ? (
                <>
                  <p className={`gallery-text letter-font-${star.font_key}`}>“{star.content}”</p>
                  <div className="gallery-card-footer">
                    <p className="letter-signature">— {star.is_anonymous ? copy.recipient_anonymous : star.sender_name}</p>
                    <time className="reveal-date">{new Date(star.created_at!).toLocaleDateString("vi-VN")}</time>
                  </div>
                </>
              ) : (
                <div className="unopened-star-placeholder">
                  <img src={`/assets/star-${star.color}.png`} alt={copy.recipient_gallery_unopened} />
                  <p>{copy.recipient_gallery_unopened}</p>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
