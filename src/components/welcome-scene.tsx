"use client";

import Link from "next/link";
import { AmbientStarField } from "@/components/ambient-star-field";
import { useSiteCopy } from "@/components/site-copy-provider";

const colors = ["mint", "sky", "lavender", "yellow", "peach", "pink", "coral", "sage"];
const stars = Array.from({ length: 56 }, (_, index) => ({
  color: colors[index % colors.length],
  left: (index * 37) % 101,
  size: 20 + ((index * 17) % 44),
  bottom: -8 + ((index * 19) % 38),
  delay: (index % 14) * 0.11,
  rotation: -24 + ((index * 29) % 49),
}));

export function WelcomeScene({ authenticated }: { authenticated: boolean }) {
  const copy = useSiteCopy();
  return (
    <main className="gift-landing scene">
      <AmbientStarField full />

      <nav className="landing-account" aria-label={copy.home_account_label}>
        {authenticated ? (
          <Link className="landing-account-primary" href="/admin">{copy.home_my_jars}</Link>
        ) : (
          <>
            <Link href="/login">{copy.home_login}</Link>
            <Link className="landing-account-primary" href="/sign-up">{copy.home_signup}</Link>
          </>
        )}
      </nav>

      <div className="landing-star-pile" aria-hidden="true">
        {stars.map((star, index) => (
          <img
            alt=""
            className="landing-star"
            key={`${star.color}-${index}`}
            src={`/assets/star-${star.color}.png`}
            style={{
              "--star-left": `${star.left}%`,
              "--star-size": `${star.size}px`,
              "--star-bottom": `${star.bottom}px`,
              "--star-delay": `${star.delay}s`,
              "--star-rotation": `${star.rotation}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <section className="landing-content">
        <p className="landing-kicker">{copy.home_kicker}</p>
        <h1><span>{copy.home_title_first}</span><strong>{copy.home_title_second}</strong></h1>
        <p className="landing-copy">{copy.home_intro_first}<br />{copy.home_intro_second}</p>
        <div className="landing-actions">
          <Link className="paper-button landing-primary" href="/create">{copy.home_create}</Link>
          <a className="landing-secondary" href="#recipient-help">{copy.home_recipient_help_link}</a>
        </div>
      </section>

      <section className="landing-help" id="recipient-help" role="dialog" aria-labelledby="recipient-help-title">
        <article>
          <a className="landing-help-close" href="#" aria-label={copy.home_help_close}>×</a>
          <h2 id="recipient-help-title">{copy.home_help_title}</h2>
          <p>{copy.home_help_body}</p>
          <a className="paper-button" href="#">{copy.home_help_confirm}</a>
        </article>
      </section>
    </main>
  );
}
