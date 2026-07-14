"use client";

import { useActionState } from "react";
import { createJar, type CreateJarState } from "@/app/create/actions";

const initialState: CreateJarState = { error: "" };

export function CreateJarForm() {
  const [state, action, pending] = useActionState(createJar, initialState);

  return (
    <form action={action} className="jar-create-form">
      <label htmlFor="recipient-name">recipient&apos;s name</label>
      <input id="recipient-name" maxLength={100} name="recipientName" placeholder="Linh" required />

      <label htmlFor="jar-title">jar title</label>
      <input id="jar-title" maxLength={160} name="title" placeholder="a little jar for Linh" required />

      <label htmlFor="jar-intro">a note before the jar opens</label>
      <textarea id="jar-intro" maxLength={1000} name="intro" placeholder="Your friends have been filling this jar with memories…" rows={4} />

      <label htmlFor="jar-passcode">recipient passcode</label>
      <input autoComplete="new-password" id="jar-passcode" maxLength={72} minLength={6} name="passcode" placeholder="at least 6 characters" required type="password" />

      <label htmlFor="jar-hint">passcode hint</label>
      <input id="jar-hint" maxLength={300} name="hint" placeholder="the day we first met — DDMMYYYY" />

      <label htmlFor="jar-open-at">planned opening time (optional)</label>
      <input id="jar-open-at" name="openAt" type="datetime-local" />

      {state.error && <p className="composer-error" role="alert">{state.error}</p>}
      <button disabled={pending} type="submit">{pending ? "folding the jar…" : "create this jar"}</button>
    </form>
  );
}
