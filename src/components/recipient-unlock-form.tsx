"use client";

import { useActionState } from "react";
import { unlockRecipient, type FormState } from "@/app/j/[slug]/actions";

export function RecipientUnlockForm({ slug, hint, opened }: { slug: string; hint: string; opened: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(unlockRecipient, { error: "" });
  return <form action={action} className="flow-paper unlock-form">
    <input name="slug" type="hidden" value={slug} />
    <h2>{opened ? "a little secret keeps this jar safe" : "this jar is still sealed"}</h2>
    {opened ? <><label>Private passcode</label><input autoComplete="one-time-code" name="passcode" required type="password" />{hint && <p className="form-note">hint: {hint}</p>}<button className="flow-submit" disabled={pending}>{pending ? "checking…" : "open my jar"}</button></> : <p>The owner has not opened it yet. Come back when they send you the word.</p>}
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
  </form>;
}
