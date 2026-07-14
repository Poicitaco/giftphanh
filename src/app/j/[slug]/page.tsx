import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecipientUnlockForm } from "@/components/recipient-unlock-form";
import { RecipientJar, type Star } from "@/components/recipient-jar";
import { AmbientStarField } from "@/components/ambient-star-field";

export const dynamic = "force-dynamic";
export default async function RecipientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_jar", { p_slug: slug });
  const jar = data?.[0];
  if (!jar) notFound();
  const sessionToken = (await cookies()).get(`jar-recipient-${slug}`)?.value;
  let stars: Star[] | null = null;
  if (sessionToken) {
    const result = await supabase.rpc("get_recipient_stars", { p_slug: slug, p_session_token: sessionToken });
    if (!result.error) stars = (result.data ?? []) as Star[];
  }
  if (stars) return <RecipientJar slug={slug} recipientName={jar.recipient_name} stars={stars} />;
  return <main className="flow-page scene"><AmbientStarField full /><Link className="composer-back" href="/">← home</Link><header className="flow-heading"><p>a little jar for</p><h1>{jar.recipient_name}</h1><h2>{jar.title}</h2>{jar.intro && <p>{jar.intro}</p>}</header><RecipientUnlockForm slug={slug} hint={jar.recipient_passcode_hint} opened={jar.status === "opened"} /></main>;
}
