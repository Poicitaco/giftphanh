import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecipientUnlockForm } from "@/components/recipient-unlock-form";
import { RecipientJar, type Star } from "@/components/recipient-jar";
import { AmbientStarField } from "@/components/ambient-star-field";
import { getSiteCopy } from "@/lib/site-copy-server";

export const dynamic = "force-dynamic";
export default async function RecipientPage() {
  const supabase = await createClient();
  const { data: rawJars } = await supabase.rpc("get_single_gift_jar");
  const rawJar = rawJars?.[0];
  if (!rawJar) notFound();
  const slug = rawJar.slug;
  const { data, error } = await supabase.rpc("get_public_jar", { p_slug: slug });
  if (error) console.error("get_public_jar failed", { code: error.code, message: error.message });
  const jar = data?.[0];
  if (!jar) notFound();
  const copy = await getSiteCopy();
  const sessionToken = (await cookies()).get(`jar-recipient-${slug}`)?.value;
  let stars: Star[] | null = null;
  if (sessionToken) {
    const result = await supabase.rpc("get_recipient_stars", { p_slug: slug, p_session_token: sessionToken });
    if (!result.error) stars = (result.data ?? []) as Star[];
  }
  if (stars) return <RecipientJar slug={slug} recipientName={jar.recipient_name} stars={stars} />;
  return <main className="flow-page scene"><AmbientStarField full /><Link className="composer-back" href="/">← {copy.recipient_back}</Link><header className="flow-heading"><p>{copy.recipient_for}</p><h1>{jar.recipient_name}</h1><h2>{jar.title}</h2>{jar.intro && <p>{jar.intro}</p>}</header><RecipientUnlockForm slug={slug} hint={jar.recipient_passcode_hint} opened={jar.status === "opened"} /></main>;
}
