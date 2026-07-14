"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitLetter, type FormState } from "@/app/j/[slug]/actions";

const initialState: FormState = { error: "" };
const colors = [
  ["sky", "Xanh trời"],
  ["lavender", "Tím mơ"],
  ["mint", "Xanh bạc hà"],
  ["sage", "Xanh lá dịu"],
  ["pink", "Hồng phấn"],
  ["peach", "Cam đào"],
  ["coral", "Đỏ san hô"],
  ["yellow", "Vàng nắng"],
] as const;
const fonts = [
  ["handwritten", "Viết tay", "Thân mật như viết trong sổ"],
  ["serif", "Thư tình", "Mềm mại và hơi điện ảnh"],
  ["typewriter", "Máy chữ", "Tinh nghịch kiểu thư bí mật"],
] as const;

const countWords = (value: string) => value.trim() ? value.trim().split(/\s+/u).length : 0;

export function ContributorForm({ slug, galleryEnabled }: { slug: string; galleryEnabled: boolean }) {
  const [state, action, pending] = useActionState(submitLetter, initialState);
  const [anonymous, setAnonymous] = useState(false);
  const [content, setContent] = useState("");
  const [fontKey, setFontKey] = useState("handwritten");

  if (state.memoryId) {
    return <section className="flow-paper flow-success">
      <span className="form-eyebrow">đã gửi thành công</span>
      <h2>Một ngôi sao vừa rơi vào lọ rồi đó ★</h2>
      <p>{state.success}</p>
      <Link className="paper-button" href={`/j/${slug}/edit/${state.memoryId}`}>giữ lại đường dẫn sửa thư</Link>
      {galleryEnabled && <Link className="text-link" href={`/j/${slug}/gallery`}>ghé xem những lá thư được chia sẻ</Link>}
    </section>;
  }

  return <form action={action} className="flow-paper letter-form">
    <input name="slug" type="hidden" value={slug} />
    <header className="letter-form-intro">
      <span className="form-eyebrow">một lá thư, một ngôi sao</span>
      <h2>Hãy viết cái gì cảm động vào đây =))))</h2>
      <p>Đừng chỉ viết “chúc mừng nha”. Kể một chuyện cũ, thú nhận một điều chưa nói, hoặc làm người ta cười trước khi khóc.</p>
    </header>

    <label htmlFor="sender-name">Ký tên để người ta còn biết ai làm mình cảm động</label>
    <input disabled={anonymous} id="sender-name" maxLength={100} name="senderName" placeholder={anonymous ? "Danh tính đã được giấu kỹ" : "Tên hoặc biệt danh của bạn"} required={!anonymous} />
    <label className="check-row"><input checked={anonymous} name="isAnonymous" onChange={(event) => setAnonymous(event.target.checked)} type="checkbox" /> Ngại quá thì giấu tên, người nhận sẽ thấy “ẩn danh”.</label>

    <div className="letter-field-heading">
      <label htmlFor="letter-content">Lá thư của bạn</label>
      <span aria-live="polite">{countWords(content).toLocaleString("vi-VN")} từ · {content.length.toLocaleString("vi-VN")}/10.000 ký tự</span>
    </div>
    <textarea className={`letter-font-${fontKey}`} id="letter-content" maxLength={10000} name="content" onChange={(event) => setContent(event.target.value)} placeholder="Một kỷ niệm, một lời chưa nói, một lời cảm ơn thật dài… cứ viết đi, tờ giấy này giữ bí mật giỏi lắm." required rows={16} value={content} />

    <fieldset className="font-picker">
      <legend>Chọn nét chữ hợp với độ sến của bạn</legend>
      <div>{fonts.map(([value, label, hint]) => <label className={`font-choice letter-font-${value}`} key={value}>
        <input checked={fontKey === value} name="fontKey" onChange={() => setFontKey(value)} type="radio" value={value} />
        <span><strong>{label}</strong><small>{hint}</small></span>
      </label>)}</div>
    </fieldset>

    <div className="form-grid">
      <div><label htmlFor="star-color">Màu ngôi sao</label><select defaultValue="sky" id="star-color" name="color">{colors.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div><label htmlFor="edit-passcode">Mật mã cứu nguy nếu lát nữa thấy sến quá</label><input id="edit-passcode" minLength={6} maxLength={72} name="editPasscode" placeholder="Ít nhất 6 ký tự" required type="password" /></div>
    </div>
    <label className="check-row"><input name="visibility" type="checkbox" value="contributors" /> Cho hội bạn đọc ké sau khi chủ lọ duyệt.</label>
    <p className="form-note">Chỉ bạn mới sửa được lá thư bằng đường dẫn và mật mã riêng. Nhớ cất cả hai ở nơi an toàn nhé.</p>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <button className="flow-submit" disabled={pending}>{pending ? "đang gấp thành ngôi sao…" : "gấp lại rồi thả vào lọ ★"}</button>
  </form>;
}
