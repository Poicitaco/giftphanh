"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitLetter, type FormState } from "@/app/j/[slug]/actions";

const initialState: FormState = { error: "" };
const colors = ["sky", "lavender", "mint", "sage", "pink", "peach", "coral", "yellow"];

export function ContributorForm({ slug, galleryEnabled }: { slug: string; galleryEnabled: boolean }) {
  const [state, action, pending] = useActionState(submitLetter, initialState);
  const [anonymous, setAnonymous] = useState(false);
  if (state.memoryId) {
    return <section className="flow-paper flow-success"><h2>your star is in the jar ★</h2><p>{state.success}</p><Link className="paper-button" href={`/j/${slug}/edit/${state.memoryId}`}>save my edit link</Link>{galleryEnabled && <Link className="text-link" href={`/j/${slug}/gallery`}>view shared letters</Link>}</section>;
  }
  return <form action={action} className="flow-paper letter-form">
    <input name="slug" type="hidden" value={slug} />
    <label>Your name</label><input disabled={anonymous} maxLength={100} name="senderName" placeholder={anonymous ? "hidden" : "only shown when the star opens"} required={!anonymous} />
    <label className="check-row"><input checked={anonymous} name="isAnonymous" onChange={(event) => setAnonymous(event.target.checked)} type="checkbox" /> send anonymously</label>
    <label>Your letter</label><textarea maxLength={10000} name="content" placeholder="Write a memory, a long letter, or anything meaningful…" required rows={12} />
    <div className="form-grid"><div><label>Star colour</label><select defaultValue="sky" name="color">{colors.map((color) => <option key={color}>{color}</option>)}</select></div><div><label>Private edit code</label><input minLength={6} maxLength={72} name="editPasscode" placeholder="6+ characters" required type="password" /></div></div>
    <label className="check-row"><input name="visibility" type="checkbox" value="contributors" /> let other contributors read this letter after approval</label>
    <p className="form-note">Nobody else can edit this letter. Keep your edit link and code somewhere safe.</p>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <button className="flow-submit" disabled={pending}>{pending ? "folding…" : "fold into a star ★"}</button>
  </form>;
}
