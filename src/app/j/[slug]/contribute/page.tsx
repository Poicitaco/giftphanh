import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContributorForm } from "@/components/contributor-form";
import { AmbientStarField } from "@/components/ambient-star-field";

export const dynamic = "force-dynamic";
export default async function ContributePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await (await createClient()).rpc("get_public_jar", { p_slug: slug });
  const jar = data?.[0]; if (!jar) notFound();
  const accepting = ["draft", "collecting"].includes(jar.status);
  return <main className="flow-page scene"><AmbientStarField /><Link className="composer-back" href="/">← home</Link><header className="flow-heading"><p>you are writing for</p><h1>{jar.recipient_name}</h1><h2>{jar.title}</h2>{jar.intro && <p>{jar.intro}</p>}</header>{accepting ? <ContributorForm slug={slug} galleryEnabled={jar.allow_contributor_gallery} /> : <section className="flow-paper"><h2>this jar is no longer collecting letters</h2><p>The owner has sealed it for {jar.recipient_name}.</p></section>}</main>;
}
