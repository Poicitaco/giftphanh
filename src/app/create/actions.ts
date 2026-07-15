"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteCopy } from "@/lib/site-copy-server";

export type CreateJarState = { error: string };

const read = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

export async function createJar(_: CreateJarState, formData: FormData): Promise<CreateJarState> {
  const copy = await getSiteCopy();
  const recipientName = read(formData, "recipientName");
  const title = read(formData, "title");
  const intro = read(formData, "intro");
  const passcode = read(formData, "passcode");
  const hint = read(formData, "hint");
  const openAt = read(formData, "openAt");

  if (!recipientName || recipientName.length > 100) return { error: `${copy.create_recipient_label} không hợp lệ.` };
  if (!title || title.length > 160) return { error: `${copy.create_title_label} không hợp lệ.` };
  if (intro.length > 1000) return { error: `${copy.create_note_label} quá dài.` };
  if (passcode.length < 6 || passcode.length > 72) return { error: `${copy.create_passcode_label} cần từ 6 đến 72 ký tự.` };
  if (hint.length > 300) return { error: `${copy.create_hint_label} quá dài.` };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { error: "Hãy đăng nhập lại." };

  const slug = `jar-${crypto.randomUUID().slice(0, 8)}`;
  const { data, error } = await supabase.rpc("create_jar", {
    p_slug: slug,
    p_recipient_name: recipientName,
    p_title: title,
    p_intro: intro,
    p_passcode: passcode,
    p_passcode_hint: hint,
    p_open_at: openAt ? new Date(openAt).toISOString() : null,
  });

  if (error || !data?.[0]) return { error: "Chưa thể tạo chiếc lọ. Hãy thử lại." };
  redirect(`/admin/jars/${data[0].id}`);
}
