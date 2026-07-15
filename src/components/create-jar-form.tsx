"use client";

import { useActionState } from "react";
import { createJar, type CreateJarState } from "@/app/create/actions";
import { useSiteCopy } from "@/components/site-copy-provider";

const initialState: CreateJarState = { error: "" };

export function CreateJarForm() {
  const copy = useSiteCopy();
  const [state, action, pending] = useActionState(createJar, initialState);

  return (
    <form action={action} className="jar-create-form">
      <label htmlFor="recipient-name">{copy.create_recipient_label}</label>
      <input id="recipient-name" maxLength={100} name="recipientName" placeholder={copy.create_recipient_placeholder} required />

      <label htmlFor="jar-title">{copy.create_title_label}</label>
      <input id="jar-title" maxLength={160} name="title" placeholder={copy.create_title_placeholder} required />

      <label htmlFor="jar-intro">{copy.create_note_label}</label>
      <textarea id="jar-intro" maxLength={1000} name="intro" placeholder={copy.create_note_placeholder} rows={4} />

      <label htmlFor="jar-passcode">{copy.create_passcode_label}</label>
      <input autoComplete="new-password" id="jar-passcode" maxLength={72} minLength={6} name="passcode" placeholder={copy.create_passcode_placeholder} required type="password" />

      <label htmlFor="jar-hint">{copy.create_hint_label}</label>
      <input id="jar-hint" maxLength={300} name="hint" placeholder={copy.create_hint_placeholder} />

      <label htmlFor="jar-open-at">{copy.create_open_at_label}</label>
      <input id="jar-open-at" name="openAt" type="datetime-local" />

      {state.error && <p className="composer-error" role="alert">{state.error}</p>}
      <button disabled={pending} type="submit">{pending ? copy.create_pending : copy.create_submit}</button>
    </form>
  );
}
