"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AmbientStarField } from "@/components/ambient-star-field";
import { useSiteCopy } from "@/components/site-copy-provider";

export function LoginForm() {
  const copy = useSiteCopy();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/write";
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loiDangNhap, setLoiDangNhap] = useState("");

  async function dangNhapGoogle() {
    setDangXuLy(true);
    setLoiDangNhap("");
    const { error: loi } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
      },
    });
    if (loi) {
      setLoiDangNhap("Dang nhap that bai, thu lai nhe.");
      setDangXuLy(false);
    }
  }

  return (
    <main className="auth-page scene">
      <AmbientStarField />
      <Link className="composer-back" href="/">
        <span aria-hidden="true">←</span> {copy.auth_back}
      </Link>
      <section className="auth-content">
        <h1>{copy.login_title}</h1>
        <p>{copy.login_intro}</p>
        <div className="auth-paper" style={{ gap: "1.2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button
            className="google-auth-button"
            onClick={dangNhapGoogle}
            disabled={dangXuLy}
            type="button"
            style={{ width: "100%", fontSize: "1rem" }}
          >
            {dangXuLy ? "Dang chuyen huong..." : copy.auth_google}
          </button>
          {loiDangNhap && (
            <span className="composer-error" role="alert">{loiDangNhap}</span>
          )}
        </div>
      </section>
    </main>
  );
}
