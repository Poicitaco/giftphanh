"use client";

import { useActionState, useState } from "react";
import { loadOwnLetter, updateOwnLetter, type EditState } from "@/app/j/[slug]/actions";

const initial: EditState = { error: "" };
export function EditLetterForm({ slug, memoryId }: { slug: string; memoryId: string }) {
  const [loaded, loadAction, loading] = useActionState(loadOwnLetter, initial);
  const [saved, saveAction, saving] = useActionState(updateOwnLetter, initial);
  const [code, setCode] = useState("");
  if (!loaded.memory) return <form action={loadAction} className="flow-paper unlock-form"><input name="slug" type="hidden" value={slug} /><input name="memoryId" type="hidden" value={memoryId} /><h2>edit your letter</h2><label>Your private edit code</label><input name="editPasscode" onChange={(e) => setCode(e.target.value)} required type="password" value={code} />{loaded.error && <p className="form-error">{loaded.error}</p>}<button className="flow-submit" disabled={loading}>{loading ? "checking…" : "unlock my letter"}</button></form>;
  const m = loaded.memory;
  return <form action={saveAction} className="flow-paper letter-form"><input name="slug" type="hidden" value={slug} /><input name="memoryId" type="hidden" value={memoryId} /><input name="editPasscode" type="hidden" value={code} /><label>Your name</label><input defaultValue={m.sender_name ?? ""} maxLength={100} name="senderName" /><label className="check-row"><input defaultChecked={m.is_anonymous} name="isAnonymous" type="checkbox" /> send anonymously</label><label>Your letter</label><textarea defaultValue={m.content} maxLength={10000} name="content" required rows={12} /><div className="form-grid"><div><label>Star colour</label><select defaultValue={m.color} name="color">{["sky","lavender","mint","sage","pink","peach","coral","yellow"].map(c => <option key={c}>{c}</option>)}</select></div></div><label className="check-row"><input defaultChecked={m.visibility === "contributors"} name="visibility" type="checkbox" value="contributors" /> let other contributors read this</label>{saved.error && <p className="form-error">{saved.error}</p>}{saved.success && <p className="form-success">{saved.success}</p>}<button className="flow-submit" disabled={saving}>{saving ? "saving…" : "save changes"}</button></form>;
}
