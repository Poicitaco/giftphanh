"use client";

import { useActionState, useState } from "react";
import { loadOwnLetter, updateOwnLetter, type EditState } from "@/app/j/[slug]/actions";
import { useSiteCopy } from "@/components/site-copy-provider";

const initial: EditState = { error: "" };
const fontKeys = ["handwritten", "serif", "typewriter"] as const;
const countWords = (value: string) => value.trim() ? value.trim().split(/\s+/u).length : 0;

export function EditLetterForm({ slug, memoryId }: { slug: string; memoryId: string }) {
  const copy = useSiteCopy();
  const colors = [["sky", copy.color_sky], ["lavender", copy.color_lavender], ["mint", copy.color_mint], ["sage", copy.color_sage], ["pink", copy.color_pink], ["peach", copy.color_peach], ["coral", copy.color_coral], ["yellow", copy.color_yellow]] as const;
  const fontLabels = { handwritten: copy.letter_font_handwritten, serif: copy.letter_font_serif, typewriter: copy.letter_font_typewriter };
  const [loaded, loadAction, loading] = useActionState(loadOwnLetter, initial);
  const [saved, saveAction, saving] = useActionState(updateOwnLetter, initial);
  const [code, setCode] = useState("");
  const [draft, setDraft] = useState<{ content: string; fontKey: string } | null>(null);

  if (!loaded.memory) return <form action={loadAction} className="flow-paper unlock-form">
    <input name="slug" type="hidden" value={slug} /><input name="memoryId" type="hidden" value={memoryId} />
    <span className="form-eyebrow">{copy.edit_private}</span><h2>{copy.edit_unlock_title}</h2>
    <label htmlFor="private-edit-code">{copy.edit_passcode_label}</label><input id="private-edit-code" name="editPasscode" onChange={(event) => setCode(event.target.value)} required type="password" value={code} />
    {loaded.error && <p className="form-error" role="alert">{loaded.error}</p>}
    <button className="flow-submit" disabled={loading}>{loading ? copy.edit_checking : copy.edit_unlock}</button>
  </form>;

  const memory = loaded.memory;
  const content = draft?.content ?? memory.content;
  const fontKey = draft?.fontKey ?? memory.font_key;
  return <form action={saveAction} className="flow-paper letter-form">
    <input name="slug" type="hidden" value={slug} /><input name="memoryId" type="hidden" value={memoryId} /><input name="editPasscode" type="hidden" value={code} />
    <header className="letter-form-intro"><span className="form-eyebrow">{copy.edit_eyebrow}</span><h2>{copy.edit_title}</h2><p>{copy.edit_intro}</p></header>
    <label htmlFor="edit-sender-name">{copy.edit_sender_label}</label><input defaultValue={memory.sender_name ?? ""} id="edit-sender-name" maxLength={100} name="senderName" />
    <label className="check-row"><input defaultChecked={memory.is_anonymous} name="isAnonymous" type="checkbox" /> {copy.edit_anonymous}</label>
    <div className="letter-field-heading"><label htmlFor="edit-letter-content">{copy.letter_content_label}</label><span aria-live="polite">{countWords(content).toLocaleString("vi-VN")} {copy.counter_words} · {content.length.toLocaleString("vi-VN")}/10.000 {copy.counter_characters}</span></div>
    <textarea className={`letter-font-${fontKey}`} id="edit-letter-content" maxLength={10000} name="content" onChange={(event) => setDraft({ content: event.target.value, fontKey })} required rows={16} value={content} />
    <fieldset className="font-picker"><legend>{copy.edit_font_label}</legend><div>{fontKeys.map((value) => <label className={`font-choice letter-font-${value}`} key={value}><input checked={fontKey === value} name="fontKey" onChange={() => setDraft({ content, fontKey: value })} type="radio" value={value} /><span><strong>{fontLabels[value]}</strong></span></label>)}</div></fieldset>
    <div className="form-grid"><div><label htmlFor="edit-star-color">{copy.letter_color_label}</label><select defaultValue={memory.color} id="edit-star-color" name="color">{colors.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
    <label className="check-row"><input defaultChecked={memory.visibility === "contributors"} name="visibility" type="checkbox" value="contributors" /> {copy.letter_share}</label>
    {saved.error && <p className="form-error" role="alert">{saved.error}</p>}{saved.success && <p className="form-success">{saved.success}</p>}
    <button className="flow-submit" disabled={saving}>{saving ? copy.edit_saving : copy.edit_save}</button>
  </form>;
}
