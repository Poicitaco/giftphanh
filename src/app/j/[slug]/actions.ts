"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteCopy } from "@/lib/site-copy-server";

export type FormState = { error: string; success?: string; memoryId?: string };
export type EditState = FormState & { memory?: EditableMemory };
export type EditableMemory = {
  id: string; sender_name: string | null; is_anonymous: boolean; content: string;
  visibility: string; color: string; font_key: LetterFont; moderation_status: string;
};
export type OpenedMemory = {
  id: string; content: string; sender_name: string | null; is_anonymous: boolean;
  color: string; font_key: LetterFont; created_at: string;
};

export type LetterFont = "handwritten" | "serif" | "typewriter";

const read = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
const cookieName = (kind: "contributor" | "recipient", slug: string) => `jar-${kind}-${slug}`;
const token = () => `${crypto.randomUUID()}${crypto.randomUUID()}`;
const fontKeys: LetterFont[] = ["handwritten", "serif", "typewriter"];
const readFont = (data: FormData): LetterFont | null => {
  const value = read(data, "fontKey") as LetterFont;
  return fontKeys.includes(value) ? value : null;
};

export async function submitLetter(_: FormState, data: FormData): Promise<FormState> {
  const copy = await getSiteCopy();
  const slug = read(data, "slug");
  const content = read(data, "content");
  const senderName = read(data, "senderName");
  const editPasscode = read(data, "editPasscode");
  const isAnonymous = data.get("isAnonymous") === "on";
  const visibility = data.get("visibility") === "contributors" ? "contributors" : "private";
  const color = read(data, "color") || "sky";
  const fontKey = readFont(data);
  if (!/^[a-z0-9][a-z0-9-]{2,63}$/.test(slug)) return { error: copy.error_invalid_slug };
  if (!content || content.length > 10000) return { error: copy.error_letter_length };
  if (!isAnonymous && (!senderName || senderName.length > 100)) return { error: copy.error_sender_required };
  if (editPasscode.length < 6 || editPasscode.length > 72) return { error: copy.error_edit_passcode_length };
  if (!fontKey) return { error: copy.error_font_invalid };

  const store = await cookies();
  const name = cookieName("contributor", slug);
  const contributorToken = store.get(name)?.value || token();
  const supabase = await createClient();
  const { data: memoryId, error } = await supabase.rpc("submit_memory", {
    p_slug: slug, p_sender_name: senderName || null, p_is_anonymous: isAnonymous,
    p_content: content, p_visibility: visibility, p_edit_passcode: editPasscode,
    p_contributor_token: contributorToken, p_color: color, p_font_key: fontKey,
    p_rotation: Math.floor(Math.random() * 13) - 6,
  });
  if (error || !memoryId) return { error: copy.error_letter_submit };
  store.set(name, contributorToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: `/j/${slug}`, maxAge: 60 * 60 * 24 * 365 });
  return { error: "", success: copy.success_letter_submit, memoryId };
}

export async function loadOwnLetter(_: EditState, data: FormData): Promise<EditState> {
  const copy = await getSiteCopy();
  const slug = read(data, "slug");
  const memoryId = read(data, "memoryId");
  const passcode = read(data, "editPasscode");
  const supabase = await createClient();
  const { data: rows, error } = await supabase.rpc("get_own_memory", { p_slug: slug, p_memory_id: memoryId, p_edit_passcode: passcode });
  const memory = rows?.[0] as EditableMemory | undefined;
  if (error || !memory) return { error: copy.error_letter_load };
  return { error: "", memory };
}

export async function updateOwnLetter(_: EditState, data: FormData): Promise<EditState> {
  const copy = await getSiteCopy();
  const slug = read(data, "slug");
  const memoryId = read(data, "memoryId");
  const editPasscode = read(data, "editPasscode");
  const content = read(data, "content");
  const senderName = read(data, "senderName");
  const isAnonymous = data.get("isAnonymous") === "on";
  const visibility = data.get("visibility") === "contributors" ? "contributors" : "private";
  const color = read(data, "color") || "sky";
  const fontKey = readFont(data);
  if (!content || content.length > 10000) return { error: copy.error_letter_length };
  if (!fontKey) return { error: copy.error_font_invalid };
  const supabase = await createClient();
  const { data: updated, error } = await supabase.rpc("update_own_memory", {
    p_slug: slug, p_memory_id: memoryId, p_edit_passcode: editPasscode,
    p_sender_name: senderName || null, p_is_anonymous: isAnonymous,
    p_content: content, p_visibility: visibility, p_color: color, p_font_key: fontKey,
  });
  if (error || !updated) return { error: copy.error_letter_update };
  revalidatePath(`/j/${slug}`);
  return { error: "", success: copy.success_letter_update };
}

export async function unlockRecipient(_: FormState, data: FormData): Promise<FormState> {
  const copy = await getSiteCopy();
  const slug = read(data, "slug");
  const passcode = read(data, "passcode");
  const store = await cookies();
  const name = cookieName("recipient", slug);
  const sessionToken = store.get(name)?.value || token();
  const supabase = await createClient();
  const { data: result, error } = await supabase.rpc("unlock_recipient", { p_slug: slug, p_passcode: passcode, p_session_token: sessionToken });
  if (error) return { error: copy.error_recipient_unlock };
  if (result === "not_opened") return { error: copy.error_recipient_not_opened };
  if (result === "locked") return { error: copy.error_recipient_locked };
  if (result !== "ok") return { error: copy.error_recipient_wrong_passcode };
  store.set(name, sessionToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: `/j/${slug}`, maxAge: 60 * 60 * 24 * 7 });
  redirect(`/j/${slug}`);
}

export async function openMemory(slug: string, memoryId: string): Promise<{ error?: string; memory?: OpenedMemory }> {
  const copy = await getSiteCopy();
  if (!/^[a-z0-9][a-z0-9-]{2,63}$/.test(slug)) return { error: copy.error_invalid_slug };
  const store = await cookies();
  const sessionToken = store.get(cookieName("recipient", slug))?.value;
  if (!sessionToken) return { error: copy.error_recipient_unlock };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("open_recipient_memory", { p_slug: slug, p_session_token: sessionToken, p_memory_id: memoryId });
  if (error || !data?.[0]) return { error: copy.error_star_open };
  return { memory: data[0] as OpenedMemory };
}
