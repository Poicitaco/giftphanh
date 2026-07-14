"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateJarState = { error: string };

const read = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

export async function createJar(_: CreateJarState, formData: FormData): Promise<CreateJarState> {
  const recipientName = read(formData, "recipientName");
  const title = read(formData, "title");
  const intro = read(formData, "intro");
  const passcode = read(formData, "passcode");
  const hint = read(formData, "hint");
  const openAt = read(formData, "openAt");

  if (!recipientName || recipientName.length > 100) return { error: "recipient name is required." };
  if (!title || title.length > 160) return { error: "jar title is required." };
  if (intro.length > 1000) return { error: "introduction is too long." };
  if (passcode.length < 6 || passcode.length > 72) return { error: "passcode must contain 6 to 72 characters." };
  if (hint.length > 300) return { error: "passcode hint is too long." };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { error: "please sign in again." };

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

  if (error || !data?.[0]) return { error: "the jar could not be created. please try again." };
  redirect(`/admin/jars/${data[0].id}`);
}
