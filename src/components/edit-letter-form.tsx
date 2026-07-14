"use client";

import { useActionState, useState } from "react";
import { loadOwnLetter, updateOwnLetter, type EditState } from "@/app/j/[slug]/actions";

const initial: EditState = { error: "" };
const fontKeys = ["handwritten", "serif", "typewriter"] as const;
const fontLabels = { handwritten: "Viết tay", serif: "Thư tình", typewriter: "Máy chữ" };
const colors = [["sky", "Xanh trời"], ["lavender", "Tím mơ"], ["mint", "Xanh bạc hà"], ["sage", "Xanh lá dịu"], ["pink", "Hồng phấn"], ["peach", "Cam đào"], ["coral", "Đỏ san hô"], ["yellow", "Vàng nắng"]] as const;
const countWords = (value: string) => value.trim() ? value.trim().split(/\s+/u).length : 0;

export function EditLetterForm({ slug, memoryId }: { slug: string; memoryId: string }) {
  const [loaded, loadAction, loading] = useActionState(loadOwnLetter, initial);
  const [saved, saveAction, saving] = useActionState(updateOwnLetter, initial);
  const [code, setCode] = useState("");
  const [draft, setDraft] = useState<{ content: string; fontKey: string } | null>(null);

  if (!loaded.memory) return <form action={loadAction} className="flow-paper unlock-form">
    <input name="slug" type="hidden" value={slug} /><input name="memoryId" type="hidden" value={memoryId} />
    <span className="form-eyebrow">khu vực riêng tư</span><h2>Mở lại lá thư của bạn</h2>
    <label htmlFor="private-edit-code">Mật mã sửa thư</label><input id="private-edit-code" name="editPasscode" onChange={(event) => setCode(event.target.value)} required type="password" value={code} />
    {loaded.error && <p className="form-error" role="alert">{loaded.error}</p>}
    <button className="flow-submit" disabled={loading}>{loading ? "đang kiểm tra…" : "mở lá thư"}</button>
  </form>;

  const memory = loaded.memory;
  const content = draft?.content ?? memory.content;
  const fontKey = draft?.fontKey ?? memory.font_key;
  return <form action={saveAction} className="flow-paper letter-form">
    <input name="slug" type="hidden" value={slug} /><input name="memoryId" type="hidden" value={memoryId} /><input name="editPasscode" type="hidden" value={code} />
    <header className="letter-form-intro"><span className="form-eyebrow">được phép đổi ý</span><h2>Sửa lại trước khi ngôi sao được mở</h2><p>Sửa xong, thư sẽ quay lại chờ chủ lọ duyệt một lần nữa.</p></header>
    <label htmlFor="edit-sender-name">Tên hoặc biệt danh</label><input defaultValue={memory.sender_name ?? ""} id="edit-sender-name" maxLength={100} name="senderName" />
    <label className="check-row"><input defaultChecked={memory.is_anonymous} name="isAnonymous" type="checkbox" /> Gửi ẩn danh.</label>
    <div className="letter-field-heading"><label htmlFor="edit-letter-content">Lá thư của bạn</label><span aria-live="polite">{countWords(content).toLocaleString("vi-VN")} từ · {content.length.toLocaleString("vi-VN")}/10.000 ký tự</span></div>
    <textarea className={`letter-font-${fontKey}`} id="edit-letter-content" maxLength={10000} name="content" onChange={(event) => setDraft({ content: event.target.value, fontKey })} required rows={16} value={content} />
    <fieldset className="font-picker"><legend>Kiểu chữ</legend><div>{fontKeys.map((value) => <label className={`font-choice letter-font-${value}`} key={value}><input checked={fontKey === value} name="fontKey" onChange={() => setDraft({ content, fontKey: value })} type="radio" value={value} /><span><strong>{fontLabels[value]}</strong></span></label>)}</div></fieldset>
    <div className="form-grid"><div><label htmlFor="edit-star-color">Màu ngôi sao</label><select defaultValue={memory.color} id="edit-star-color" name="color">{colors.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
    <label className="check-row"><input defaultChecked={memory.visibility === "contributors"} name="visibility" type="checkbox" value="contributors" /> Cho hội bạn đọc ké sau khi chủ lọ duyệt.</label>
    {saved.error && <p className="form-error" role="alert">{saved.error}</p>}{saved.success && <p className="form-success">{saved.success}</p>}
    <button className="flow-submit" disabled={saving}>{saving ? "đang gấp lại…" : "lưu và gấp lại ★"}</button>
  </form>;
}
