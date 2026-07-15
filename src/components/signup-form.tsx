"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { AmbientStarField } from "@/components/ambient-star-field";
import { useSiteCopy } from "@/components/site-copy-provider";

export function SignupForm() {
  const copy = useSiteCopy();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) return;
    setError("");
    const { error: signUpError } = await createClient().auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="auth-page scene">
      <AmbientStarField />
      <Link className="composer-back" href="/"><span aria-hidden="true">←</span> {copy.auth_back}</Link>
      <section className="auth-content">
        <h1>{copy.signup_title}</h1>
        <p>{copy.signup_intro}</p>
        <form className="auth-paper" onSubmit={submit}>
          <label className="sr-only" htmlFor="signup-email">{copy.auth_email_label}</label>
          <input id="signup-email" onChange={(event) => { setEmail(event.target.value); setSent(false); }} placeholder={copy.auth_email_placeholder} required type="email" value={email} />
          <label className="sr-only" htmlFor="signup-password">{copy.auth_password_label}</label>
          <input id="signup-password" minLength={8} onChange={(event) => { setPassword(event.target.value); setSent(false); }} placeholder={copy.signup_password_placeholder} required type="password" value={password} />
          <button type="submit" disabled={!email.trim() || password.length < 8}>{copy.signup_submit}</button>
          {error && <span className="composer-error" role="alert">{error}</span>}
          {sent && <span role="status">{copy.signup_sent}</span>}
          <GoogleAuthButton label={copy.auth_google} />
          <Link href="/login">{copy.signup_login_link}</Link>
        </form>
      </section>
    </main>
  );
}
