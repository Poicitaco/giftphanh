import Link from "next/link";

const stars = [
  ["mint", 3, 80, 27], ["sky", 2, 61, 46], ["lavender", 18, 62, 38],
  ["sky", 24, 92, 38], ["lavender", 28, 83, 46], ["mint", 31, 89, 20],
  ["yellow", 36, 86, 42], ["peach", 46, 84, 30], ["yellow", 55, 79, 48],
  ["pink", 51, 93, 50], ["sky", 67, 42, 40], ["mint", 74, 61, 24],
  ["pink", 78, 69, 48], ["mint", 76, 80, 44], ["lavender", 85, 77, 34],
  ["sky", 87, 18, 38], ["lavender", 94, 94, 40], ["yellow", 57, 91, 30],
  ["coral", 22, 76, 32], ["mint", 96, 50, 20], ["sky", 46, 57, 25],
  ["lavender", 65, 72, 25], ["pink", 10, 7, 42], ["mint", 24, 18, 22],
] as const;

export function WelcomeScene() {
  return (
    <main className="welcome-scene relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-6 py-12 text-center">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(244,217,120,.13),transparent_28%),radial-gradient(circle_at_85%_30%,rgba(229,194,212,.13),transparent_30%),radial-gradient(circle_at_50%_85%,rgba(233,167,185,.09),transparent_35%),#fff8ed]" />

      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {stars.map(([color, left, top, size], index) => (
          <img
            alt=""
            className="falling-star absolute h-auto select-none"
            key={`${color}-${left}`}
            src={`/assets/star-${color}.png`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              "--star-delay": `${(index % 6) * -.45}s`,
              "--star-rotation": `${index % 2 ? 6 : -6}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <section className="welcome-center relative z-10 w-full max-w-lg">
        <h1 className="font-['Cormorant_Garamond',serif] text-[72px] leading-[.72] font-normal tracking-[-.035em] text-[#2c6bb3] sm:text-8xl">
          <span className="block whitespace-nowrap">a little jar</span>
          <span className="mt-5 block font-['Waiting_for_the_Sunrise',cursive] text-[#f3ca16] sm:mt-7">
            of stars
          </span>
        </h1>

        <p className="mt-8 font-['Space_Mono',monospace] text-xs leading-[1.75] tracking-[-.03em] text-[#202020] sm:text-sm">
          Fold each happy memory into a star.
          <br />
          Tap the jar to let one drift back to you.
        </p>

        <Link
          className="mt-7 inline-flex min-h-12 items-center gap-3 bg-[url('/assets/parchment.png')] bg-cover px-9 py-2 font-['Space_Mono',monospace] text-lg tracking-[.04em] text-[#29231e] shadow-[0_3px_7px_rgba(91,59,19,.16)] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c6bb3] sm:text-xl"
          href="/add"
        >
          <span aria-hidden="true" className="text-[#f3ca16]">★</span>
          create a star
        </Link>
      </section>

      <style>{`
        .falling-star {
          animation: star-float 3.4s ease-in-out var(--star-delay) infinite alternate;
          filter: drop-shadow(0 2px 2px rgb(72 55 37 / .12));
          opacity: .92;
        }

        @keyframes star-float {
          from { transform: translateY(0) rotate(calc(var(--star-rotation) * -1)); }
          to { transform: translateY(-9px) rotate(var(--star-rotation)); }
        }

        @media (prefers-reduced-motion: reduce) {
          .falling-star { animation: none; }
        }

      `}</style>
    </main>
  );
}
