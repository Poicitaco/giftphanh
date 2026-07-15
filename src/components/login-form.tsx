"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { AmbientStarField } from "@/components/ambient-star-field";
import { useSiteCopy } from "@/components/site-copy-provider";

export function LoginForm() {
  const copy = useSiteCopy();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const { error: loginError } = await createClient().auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(copy.login_error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="auth-page scene">
      <AmbientStarField />
      <Link className="composer-back" href="/"><span aria-hidden="true">←</span> {copy.auth_back}</Link>
      <section className="auth-content">
        <h1>{copy.login_title}</h1>
        <p>{copy.login_intro}</p>
        <form className="auth-paper" onSubmit={submit}>
          <label className="sr-only" htmlFor="login-email">{copy.auth_email_label}</label>
          <input id="login-email" onChange={(event) => setEmail(event.target.value)} placeholder={copy.auth_email_placeholder} required type="email" value={email} />
          <label className="sr-only" htmlFor="login-password">{copy.auth_password_label}</label>
          <input id="login-password" onChange={(event) => setPassword(event.target.value)} placeholder={copy.login_password_placeholder} required type="password" value={password} />
          <button type="submit" disabled={!email.trim() || !password}>{copy.login_submit}</button>
          {error && <span className="composer-error" role="alert">{error}</span>}
          <GoogleAuthButton label={copy.auth_google} />
          <Link href="/sign-up">{copy.login_signup_link}</Link>
        </form>
      </section>
    </main>
  );
}
