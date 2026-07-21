import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContributorForm } from "@/components/contributor-form";
import { AmbientStarField } from "@/components/ambient-star-field";
import { getSiteCopy } from "@/lib/site-copy-server";

export const dynamic = "force-dynamic";
export default async function ContributePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await (await createClient()).rpc("get_public_jar", { p_slug: slug });
  if (error) console.error("get_public_jar failed", { code: error.code, message: error.message });
  const jar = data?.[0]; if (!jar) notFound();
  const accepting = ["draft", "collecting"].includes(jar.status);
  const copy = await getSiteCopy();
  return <main className="flow-page scene"><AmbientStarField /><Link className="composer-back" href="/">← {copy.contribute_back}</Link><header className="flow-heading"><p>{copy.contribute_writing_for}</p><h1>{jar.recipient_name}</h1><h2>{jar.title}</h2>{jar.intro && <p>{jar.intro}</p>}</header>{accepting ? <ContributorForm slug={slug} galleryEnabled={jar.allow_contributor_gallery} /> : <section className="flow-paper"><h2>{copy.contribute_closed_title}</h2><p>{copy.contribute_closed_body}</p></section>}</main>;
}
