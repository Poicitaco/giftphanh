"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { defaultSiteCopy, type SiteCopy, type SiteCopyKey } from "@/lib/site-copy";
import { isSuperAdminEmail } from "@/lib/site-copy-server";

export async function updateSiteCopy(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!isSuperAdminEmail(data?.claims?.email)) throw new Error("Forbidden");

  const copy = {} as SiteCopy;
  for (const key of Object.keys(defaultSiteCopy) as SiteCopyKey[]) {
    const value = String(formData.get(key) ?? "").trim();
    if (!value || value.length > 2000) throw new Error(`Invalid site copy: ${key}`);
    copy[key] = value;
  }

  const { error } = await supabase.from("site_settings").upsert({ id: true, copy, updated_at: new Date().toISOString() });
  if (error) throw new Error("Could not save site copy");
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
