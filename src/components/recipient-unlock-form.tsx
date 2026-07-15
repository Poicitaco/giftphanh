"use client";

import { useActionState } from "react";
import { unlockRecipient, type FormState } from "@/app/j/[slug]/actions";
import { useSiteCopy } from "@/components/site-copy-provider";

export function RecipientUnlockForm({ slug, hint, opened }: { slug: string; hint: string; opened: boolean }) {
  const copy = useSiteCopy();
  const [state, action, pending] = useActionState<FormState, FormData>(unlockRecipient, { error: "" });
  return <form action={action} className="flow-paper unlock-form">
    <input name="slug" type="hidden" value={slug} />
    <h2>{opened ? copy.recipient_secret_title : copy.recipient_sealed_title}</h2>
    {opened ? <><label>{copy.recipient_passcode_label}</label><input autoComplete="one-time-code" name="passcode" required type="password" />{hint && <p className="form-note">{copy.recipient_hint_prefix} {hint}</p>}<button className="flow-submit" disabled={pending}>{pending ? copy.recipient_checking : copy.recipient_unlock}</button></> : <p>{copy.recipient_waiting}</p>}
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
  </form>;
}
