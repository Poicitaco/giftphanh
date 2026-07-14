"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string; success?: string; memoryId?: string };
export type EditState = FormState & { memory?: EditableMemory };
export type EditableMemory = {
  id: string; sender_name: string | null; is_anonymous: boolean; content: string;
  visibility: string; color: string; moderation_status: string;
};
export type OpenedMemory = {
  id: string; content: string; sender_name: string | null; is_anonymous: boolean;
  color: string; created_at: string;
};

const read = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
const cookieName = (kind: "contributor" | "recipient", slug: string) => `jar-${kind}-${slug}`;
const token = () => `${crypto.randomUUID()}${crypto.randomUUID()}`;

export async function submitLetter(_: FormState, data: FormData): Promise<FormState> {
  const slug = read(data, "slug");
  const content = read(data, "content");
  const senderName = read(data, "senderName");
  const editPasscode = read(data, "editPasscode");
  const isAnonymous = data.get("isAnonymous") === "on";
  const visibility = data.get("visibility") === "contributors" ? "contributors" : "private";
  const color = read(data, "color") || "sky";
  if (!/^[a-z0-9][a-z0-9-]{2,63}$/.test(slug)) return { error: "invalid jar link." };
  if (!content || content.length > 10000) return { error: "write between 1 and 10,000 characters." };
  if (!isAnonymous && (!senderName || senderName.length > 100)) return { error: "your name is required." };
  if (editPasscode.length < 6 || editPasscode.length > 72) return { error: "edit code must contain 6 to 72 characters." };

  const store = await cookies();
  const name = cookieName("contributor", slug);
  const contributorToken = store.get(name)?.value || token();
  const supabase = await createClient();
  const { data: memoryId, error } = await supabase.rpc("submit_memory", {
    p_slug: slug, p_sender_name: senderName || null, p_is_anonymous: isAnonymous,
    p_content: content, p_visibility: visibility, p_edit_passcode: editPasscode,
    p_contributor_token: contributorToken, p_color: color,
    p_rotation: Math.floor(Math.random() * 13) - 6,
  });
  if (error || !memoryId) return { error: error?.message || "the letter could not be saved." };
  store.set(name, contributorToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: `/j/${slug}`, maxAge: 60 * 60 * 24 * 365 });
  return { error: "", success: "Your letter is safely folded into a star. Save the edit link and your private edit code.", memoryId };
}

export async function loadOwnLetter(_: EditState, data: FormData): Promise<EditState> {
  const slug = read(data, "slug");
  const memoryId = read(data, "memoryId");
  const passcode = read(data, "editPasscode");
  const supabase = await createClient();
  const { data: rows, error } = await supabase.rpc("get_own_memory", { p_slug: slug, p_memory_id: memoryId, p_edit_passcode: passcode });
  const memory = rows?.[0] as EditableMemory | undefined;
  if (error || !memory) return { error: "wrong edit code or letter not found." };
  return { error: "", memory };
}

export async function updateOwnLetter(_: EditState, data: FormData): Promise<EditState> {
  const slug = read(data, "slug");
  const memoryId = read(data, "memoryId");
  const editPasscode = read(data, "editPasscode");
  const content = read(data, "content");
  const senderName = read(data, "senderName");
  const isAnonymous = data.get("isAnonymous") === "on";
  const visibility = data.get("visibility") === "contributors" ? "contributors" : "private";
  const color = read(data, "color") || "sky";
  if (!content || content.length > 10000) return { error: "write between 1 and 10,000 characters." };
  const supabase = await createClient();
  const { data: updated, error } = await supabase.rpc("update_own_memory", {
    p_slug: slug, p_memory_id: memoryId, p_edit_passcode: editPasscode,
    p_sender_name: senderName || null, p_is_anonymous: isAnonymous,
    p_content: content, p_visibility: visibility, p_color: color,
  });
  if (error || !updated) return { error: "could not update the letter. Check your code or ask the jar owner." };
  revalidatePath(`/j/${slug}`);
  return { error: "", success: "Letter updated. It is waiting for the owner to approve it again." };
}

export async function unlockRecipient(_: FormState, data: FormData): Promise<FormState> {
  const slug = read(data, "slug");
  const passcode = read(data, "passcode");
  const store = await cookies();
  const name = cookieName("recipient", slug);
  const sessionToken = store.get(name)?.value || token();
  const supabase = await createClient();
  const { data: result, error } = await supabase.rpc("unlock_recipient", { p_slug: slug, p_passcode: passcode, p_session_token: sessionToken });
  if (error) return { error: "could not unlock this jar." };
  if (result === "not_opened") return { error: "This jar is still sealed. The owner will tell you when it is ready." };
  if (result === "locked") return { error: "Too many attempts. Try again in 15 minutes." };
  if (result !== "ok") return { error: "That passcode does not fit this jar." };
  store.set(name, sessionToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: `/j/${slug}`, maxAge: 60 * 60 * 24 * 7 });
  redirect(`/j/${slug}`);
}

export async function openMemory(slug: string, memoryId: string): Promise<{ error?: string; memory?: OpenedMemory }> {
  if (!/^[a-z0-9][a-z0-9-]{2,63}$/.test(slug)) return { error: "invalid jar" };
  const store = await cookies();
  const sessionToken = store.get(cookieName("recipient", slug))?.value;
  if (!sessionToken) return { error: "unlock the jar again" };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("open_recipient_memory", { p_slug: slug, p_session_token: sessionToken, p_memory_id: memoryId });
  if (error || !data?.[0]) return { error: "this star could not be opened" };
  return { memory: data[0] as OpenedMemory };
}
