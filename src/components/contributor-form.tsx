"use client";

import Link from "next/link";
import { useActionState, useState, useRef, useCallback, useTransition } from "react";
import { submitLetter, type FormState } from "@/app/j/[slug]/actions";
import { useSiteCopy } from "@/components/site-copy-provider";

const initialState: FormState = { error: "" };
const demWordCount = (value: string) => value.trim() ? value.trim().split(/\s+/u).length : 0;

const MAX_PHOTO_MB = 5;
const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function ContributorForm({ slug, galleryEnabled, displayName }: { slug: string; galleryEnabled: boolean; displayName: string }) {
  const copy = useSiteCopy();
  const colors = [["sky", copy.color_sky], ["lavender", copy.color_lavender], ["mint", copy.color_mint], ["sage", copy.color_sage], ["pink", copy.color_pink], ["peach", copy.color_peach], ["coral", copy.color_coral], ["yellow", copy.color_yellow]] as const;
  const fonts = [["handwritten", copy.letter_font_handwritten, copy.letter_font_handwritten_hint], ["serif", copy.letter_font_serif, copy.letter_font_serif_hint], ["typewriter", copy.letter_font_typewriter, copy.letter_font_typewriter_hint]] as const;
  const [state, dispatchAction] = useActionState(submitLetter, initialState);
  const [noiDung, setNoiDung] = useState("");
  const [phongChu, setPhongChu] = useState("handwritten");
  const [anhXemTruoc, setAnhXemTruoc] = useState<string | null>(null);
  const [anhFile, setAnhFile] = useState<File | null>(null);
  const [dangKeoTha, setDangKeoTha] = useState(false);
  const [loiAnh, setLoiAnh] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [dangUploadAnh, setDangUploadAnh] = useState(false);
  const [dangNopForm, startTransition] = useTransition();
  const inputAnhRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const xuLyChonAnh = useCallback((file: File) => {
    setLoiAnh("");
    setPhotoUrl(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLoiAnh("Chi chap nhan anh JPG, PNG, GIF hoac WEBP.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setLoiAnh(`Anh khong duoc vuot qua ${MAX_PHOTO_MB}MB.`);
      return;
    }
    setAnhFile(file);
    const docReader = new FileReader();
    docReader.onload = (e) => setAnhXemTruoc(e.target?.result as string);
    docReader.readAsDataURL(file);
  }, []);

  const xuLyThayDoiFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) xuLyChonAnh(file);
  };

  const xuLyKeoTha = (e: React.DragEvent) => {
    e.preventDefault();
    setDangKeoTha(false);
    const file = e.dataTransfer.files?.[0];
    if (file) xuLyChonAnh(file);
  };

  const xoaAnh = () => {
    setAnhXemTruoc(null);
    setAnhFile(null);
    setLoiAnh("");
    setPhotoUrl(null);
    if (inputAnhRef.current) inputAnhRef.current.value = "";
  };

  const uploadAnhTruocKhiGui = async (): Promise<string | null> => {
    if (!anhFile) return null;
    setDangUploadAnh(true);
    try {
      const fd = new FormData();
      fd.append("file", anhFile);
      const res = await fetch("/api/upload-photo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || json.error) {
        setLoiAnh(json.error || "Upload anh that bai.");
        return null;
      }
      setPhotoUrl(json.url);
      return json.url as string;
    } finally {
      setDangUploadAnh(false);
    }
  };

  const xuLyGuiForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    let urlAnh = photoUrl;
    if (anhFile && !photoUrl) {
      urlAnh = await uploadAnhTruocKhiGui();
      if (anhFile && !urlAnh) return; // Upload loi, khong gui
    }

    // Gan gia tri photo_url vao form truoc khi submit
    const inputAnUrl = form.querySelector<HTMLInputElement>('input[name="photoUrl"]');
    if (inputAnUrl) inputAnUrl.value = urlAnh ?? "";

    startTransition(() => {
      const formData = new FormData(form);
      dispatchAction(formData);
    });
  };

  const dangXuLy = dangUploadAnh || dangNopForm;

  if (state.memoryId) {
    return <section className="flow-paper flow-success">
      <span className="form-eyebrow">{copy.letter_success_eyebrow}</span>
      <h2>{copy.letter_success_title}</h2>
      <p>{state.success}</p>
      <Link className="paper-button" href={`/j/${slug}/edit/${state.memoryId}`}>{copy.letter_edit_link}</Link>
      {galleryEnabled && <Link className="text-link" href={`/j/${slug}/gallery`}>{copy.letter_gallery_link}</Link>}
    </section>;
  }

  return <form ref={formRef} onSubmit={xuLyGuiForm} className="flow-paper letter-form">
    <input name="slug" type="hidden" value={slug} />
    <input name="photoUrl" type="hidden" value={photoUrl ?? ""} />
    <header className="letter-form-intro">
      <span className="form-eyebrow">{copy.letter_eyebrow}</span>
      <h2>{copy.letter_title}</h2>
      <p>{copy.letter_intro}</p>
    </header>

    <label>Nguoi gui</label>
    <div style={{ marginBottom: "1rem", padding: "0.8rem 0.6rem", background: "rgba(44,107,179,0.07)", border: "1px solid rgba(44,107,179,0.18)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <strong style={{ color: "#1e2520", fontSize: "0.9rem" }}>{displayName}</strong>
      <Link href="/settings" style={{ fontSize: "0.78rem", color: "#2c6bb3", textDecoration: "underline" }}>Doi ten</Link>
    </div>
    <input type="hidden" name="senderName" value={displayName} />

    <div className="letter-field-heading">
      <label htmlFor="letter-content">{copy.letter_content_label}</label>
      <span aria-live="polite">{demWordCount(noiDung).toLocaleString("vi-VN")} {copy.counter_words} · {noiDung.length.toLocaleString("vi-VN")}/10.000 {copy.counter_characters}</span>
    </div>
    <textarea className={`letter-font-${phongChu}`} id="letter-content" maxLength={10000} name="content" onChange={(event) => setNoiDung(event.target.value)} placeholder={copy.letter_content_placeholder} required rows={16} value={noiDung} />

    <fieldset className="font-picker">
      <legend>{copy.letter_font_label}</legend>
      <div>{fonts.map(([value, label, hint]) => <label className={`font-choice letter-font-${value}`} key={value}>
        <input checked={phongChu === value} name="fontKey" onChange={() => setPhongChu(value)} type="radio" value={value} />
        <span><strong>{label}</strong><small>{hint}</small></span>
      </label>)}</div>
    </fieldset>

    {/* Phan dinh kem anh */}
    <div className="photo-upload-section">
      <label>Anh dinh kem (Tuy chon)</label>
      {!anhXemTruoc ? (
        <div
          className={`photo-drop-zone${dangKeoTha ? " is-dragging" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDangKeoTha(true); }}
          onDragLeave={() => setDangKeoTha(false)}
          onDrop={xuLyKeoTha}
        >
          <input
            ref={inputAnhRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={xuLyThayDoiFile}
          />
          <div className="photo-drop-icon">&#128247;</div>
          <div className="photo-drop-text">
            <strong>Bam de chon anh hoac keo tha vao day</strong>
            JPG, PNG, GIF, WEBP &mdash; toi da {MAX_PHOTO_MB}MB
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div className="photo-preview-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={anhXemTruoc} alt="Anh dinh kem" className="photo-preview-img" />
            <button type="button" className="photo-preview-remove" onClick={xoaAnh} aria-label="Xoa anh">x</button>
          </div>
          <p className="photo-size-hint">
            {anhFile?.name} ({((anhFile?.size ?? 0) / 1024 / 1024).toFixed(2)}MB)
            {photoUrl && <span style={{ color: "#476448", marginLeft: "0.5rem" }}>&#10003; Da upload</span>}
          </p>
        </div>
      )}
      {loiAnh && <p className="form-error" role="alert">{loiAnh}</p>}
    </div>

    <div className="form-grid">
      <div><label htmlFor="star-color">{copy.letter_color_label}</label><select defaultValue="sky" id="star-color" name="color">{colors.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div><label htmlFor="edit-passcode">{copy.letter_edit_passcode_label} (Tuy chon)</label><input id="edit-passcode" maxLength={72} name="editPasscode" placeholder="De trong neu khong can chinh sua sau" type="password" /></div>
    </div>
    
    <div className="form-grid">
      <div><label htmlFor="recipient-password">Mat khau ngoi sao (Tuy chon)</label><input id="recipient-password" maxLength={72} name="recipientPassword" placeholder="Nhap mat khau de mo..." type="text" /></div>
      <div><label htmlFor="recipient-password-hint">Goi y mat khau</label><input id="recipient-password-hint" maxLength={100} name="recipientPasswordHint" placeholder="VD: Ngay sinh cua minh..." type="text" /></div>
    </div>
    
    <p className="form-note">Mat khau ngoi sao giup ban khoa thu lai, nguoi nhan phai doan dung mat khau moi xem duoc.</p>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <button className="flow-submit" disabled={dangXuLy} type="submit">
      {dangUploadAnh ? "Dang upload anh..." : dangNopForm ? copy.letter_pending : copy.letter_submit}
    </button>
  </form>;
}
