"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setJarStatus(id: string, status: string) {
  if (!["collecting", "locked", "opened"].includes(status)) return;
  const supabase = await createClient();
  await supabase.from("jars").update({ status, opened_at: status === "opened" ? new Date().toISOString() : null }).eq("id", id);
  revalidatePath(`/admin/jars/${id}`);
}
export async function setMemoryStatus(jarId: string, memoryId: string, moderationStatus: string) {
  if (!["approved", "hidden"].includes(moderationStatus)) return;
  const supabase = await createClient();
  await supabase.from("memories").update({ moderation_status: moderationStatus }).eq("id", memoryId);
  revalidatePath(`/admin/jars/${jarId}`);
}
export async function setGallery(id: string, enabled: string) {
  const supabase = await createClient();
  await supabase.from("jars").update({ allow_contributor_gallery: enabled === "true" }).eq("id", id);
  revalidatePath(`/admin/jars/${id}`);
}
