import type { CSSProperties } from "react";

const colors = ["mint", "sky", "lavender", "yellow", "peach", "pink", "coral", "sage"];

export function AmbientStarField({ full = false }: { full?: boolean }) {
  const count = full ? 24 : 10;

  return (
    <div className={`gift-ambient-stars ${full ? "is-full" : "is-quiet"}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <img
          alt=""
          key={index}
          src={`/assets/star-${colors[index % colors.length]}.png`}
          style={{
            "--ambient-left": `${(index * 43 + 7) % 101}%`,
            "--ambient-size": `${16 + ((index * 23) % (full ? 58 : 32))}px`,
            "--ambient-duration": `${5.8 + ((index * 17) % 54) / 10}s`,
            "--ambient-delay": `${-((index * 1.37) % 9)}s`,
            "--ambient-drift": `${-34 + ((index * 29) % 69)}px`,
            "--ambient-rotation": `${90 + ((index * 47) % 260)}deg`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
