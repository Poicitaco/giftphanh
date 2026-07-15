import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AmbientStarField } from "@/components/ambient-star-field";
import { getSiteCopy } from "@/lib/site-copy-server";

export const dynamic = "force-dynamic";
type SharedLetter = { id: string; content: string; sender_name: string | null; is_anonymous: boolean; color: string; created_at: string };
export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const contributorToken = (await cookies()).get(`jar-contributor-${slug}`)?.value;
  let letters: SharedLetter[] = [];
  if (contributorToken) {
    const { data } = await (await createClient()).rpc("get_contributor_gallery", { p_slug: slug, p_contributor_token: contributorToken });
    letters = (data ?? []) as SharedLetter[];
  }
  const copy = await getSiteCopy();
  return <main className="flow-page scene"><AmbientStarField /><Link className="composer-back" href={`/j/${slug}/contribute`}>← {copy.gallery_back}</Link><header className="flow-heading"><h1>{copy.gallery_title}</h1><p>{copy.gallery_intro}</p></header>{!contributorToken ? <section className="flow-paper"><h2>{copy.gallery_private_title}</h2><p>{copy.gallery_private_body}</p></section> : <section className="shared-grid">{letters.map((letter) => <article className={`shared-letter memory-card-${letter.color}`} key={letter.id}><p>“{letter.content}”</p><span>— {letter.is_anonymous ? copy.gallery_anonymous : letter.sender_name}</span></article>)}{!letters.length && <p>{copy.gallery_empty}</p>}</section>}</main>;
}
