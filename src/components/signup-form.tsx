"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/google-auth-button";

export function SignupForm() {
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
      <Link className="composer-back" href="/"><span aria-hidden="true">←</span> back</Link>
      <section className="auth-content">
        <h1>sign up</h1>
        <p>create an admin account to keep your jars safe.</p>
        <form className="auth-paper" onSubmit={submit}>
          <label className="sr-only" htmlFor="signup-email">Email</label>
          <input id="signup-email" onChange={(event) => { setEmail(event.target.value); setSent(false); }} placeholder="you@example.com" required type="email" value={email} />
          <label className="sr-only" htmlFor="signup-password">Password</label>
          <input id="signup-password" minLength={8} onChange={(event) => { setPassword(event.target.value); setSent(false); }} placeholder="at least 8 characters" required type="password" value={password} />
          <button type="submit" disabled={!email.trim() || password.length < 8}>create admin account</button>
          {error && <span className="composer-error" role="alert">{error}</span>}
          {sent && <span role="status">check your inbox to confirm your admin account.</span>}
          <GoogleAuthButton />
          <Link href="/login">already have an account? sign in</Link>
        </form>
      </section>
    </main>
  );
}
