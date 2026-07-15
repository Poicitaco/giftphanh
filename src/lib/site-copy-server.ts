import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { defaultSiteCopy, mergeSiteCopy, SUPER_ADMIN_EMAIL } from "@/lib/site-copy";

export const getSiteCopy = cache(async () => {
  const { data, error } = await (await createClient()).from("site_settings").select("copy").eq("id", true).maybeSingle();
  return error ? mergeSiteCopy(defaultSiteCopy) : mergeSiteCopy(data?.copy);
});

export const isSuperAdminEmail = (email: unknown) => typeof email === "string" && email.toLowerCase() === SUPER_ADMIN_EMAIL;
