"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitLetter, type FormState } from "@/app/j/[slug]/actions";
import { useSiteCopy } from "@/components/site-copy-provider";

const initialState: FormState = { error: "" };
const countWords = (value: string) => value.trim() ? value.trim().split(/\s+/u).length : 0;

export function ContributorForm({ slug, galleryEnabled }: { slug: string; galleryEnabled: boolean }) {
  const copy = useSiteCopy();
  const colors = [["sky", copy.color_sky], ["lavender", copy.color_lavender], ["mint", copy.color_mint], ["sage", copy.color_sage], ["pink", copy.color_pink], ["peach", copy.color_peach], ["coral", copy.color_coral], ["yellow", copy.color_yellow]] as const;
  const fonts = [["handwritten", copy.letter_font_handwritten, copy.letter_font_handwritten_hint], ["serif", copy.letter_font_serif, copy.letter_font_serif_hint], ["typewriter", copy.letter_font_typewriter, copy.letter_font_typewriter_hint]] as const;
  const [state, action, pending] = useActionState(submitLetter, initialState);
  const [anonymous, setAnonymous] = useState(false);
  const [content, setContent] = useState("");
  const [fontKey, setFontKey] = useState("handwritten");

  if (state.memoryId) {
    return <section className="flow-paper flow-success">
      <span className="form-eyebrow">{copy.letter_success_eyebrow}</span>
      <h2>{copy.letter_success_title}</h2>
      <p>{state.success}</p>
      <Link className="paper-button" href={`/j/${slug}/edit/${state.memoryId}`}>{copy.letter_edit_link}</Link>
      {galleryEnabled && <Link className="text-link" href={`/j/${slug}/gallery`}>{copy.letter_gallery_link}</Link>}
    </section>;
  }

  return <form action={action} className="flow-paper letter-form">
    <input name="slug" type="hidden" value={slug} />
    <header className="letter-form-intro">
      <span className="form-eyebrow">{copy.letter_eyebrow}</span>
      <h2>{copy.letter_title}</h2>
      <p>{copy.letter_intro}</p>
    </header>

    <label htmlFor="sender-name">{copy.letter_sender_label}</label>
    <input disabled={anonymous} id="sender-name" maxLength={100} name="senderName" placeholder={anonymous ? copy.letter_sender_anonymous_placeholder : copy.letter_sender_placeholder} required={!anonymous} />
    <label className="check-row"><input checked={anonymous} name="isAnonymous" onChange={(event) => setAnonymous(event.target.checked)} type="checkbox" /> {copy.letter_anonymous}</label>

    <div className="letter-field-heading">
      <label htmlFor="letter-content">{copy.letter_content_label}</label>
      <span aria-live="polite">{countWords(content).toLocaleString("vi-VN")} {copy.counter_words} · {content.length.toLocaleString("vi-VN")}/10.000 {copy.counter_characters}</span>
    </div>
    <textarea className={`letter-font-${fontKey}`} id="letter-content" maxLength={10000} name="content" onChange={(event) => setContent(event.target.value)} placeholder={copy.letter_content_placeholder} required rows={16} value={content} />

    <fieldset className="font-picker">
      <legend>{copy.letter_font_label}</legend>
      <div>{fonts.map(([value, label, hint]) => <label className={`font-choice letter-font-${value}`} key={value}>
        <input checked={fontKey === value} name="fontKey" onChange={() => setFontKey(value)} type="radio" value={value} />
        <span><strong>{label}</strong><small>{hint}</small></span>
      </label>)}</div>
    </fieldset>

    <div className="form-grid">
      <div><label htmlFor="star-color">{copy.letter_color_label}</label><select defaultValue="sky" id="star-color" name="color">{colors.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div><label htmlFor="edit-passcode">{copy.letter_edit_passcode_label}</label><input id="edit-passcode" minLength={6} maxLength={72} name="editPasscode" placeholder={copy.letter_edit_passcode_placeholder} required type="password" /></div>
    </div>
    <label className="check-row"><input name="visibility" type="checkbox" value="contributors" /> {copy.letter_share}</label>
    <p className="form-note">{copy.letter_private_note}</p>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <button className="flow-submit" disabled={pending}>{pending ? copy.letter_pending : copy.letter_submit}</button>
  </form>;
}
