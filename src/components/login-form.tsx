"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { AmbientStarField } from "@/components/ambient-star-field";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const { error: loginError } = await createClient().auth.signInWithPassword({ email, password });
    if (loginError) {
      setError("email or password is incorrect.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="auth-page scene">
      <AmbientStarField />
      <Link className="composer-back" href="/"><span aria-hidden="true">←</span> back</Link>
      <section className="auth-content">
        <h1>admin sign in</h1>
        <p>open the private door to your jars.</p>
        <form className="auth-paper" onSubmit={submit}>
          <label className="sr-only" htmlFor="login-email">Email</label>
          <input id="login-email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} />
          <label className="sr-only" htmlFor="login-password">Password</label>
          <input id="login-password" onChange={(event) => setPassword(event.target.value)} placeholder="password" required type="password" value={password} />
          <button type="submit" disabled={!email.trim() || !password}>sign in</button>
          {error && <span className="composer-error" role="alert">{error}</span>}
          <GoogleAuthButton />
          <Link href="/sign-up">create an admin account</Link>
        </form>
      </section>
    </main>
  );
}
