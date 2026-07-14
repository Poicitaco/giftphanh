import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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
  return <main className="flow-page scene"><Link className="composer-back" href={`/j/${slug}/contribute`}>← write a letter</Link><header className="flow-heading"><h1>shared letters</h1><p>Only approved letters whose writers chose to share appear here.</p></header>{!contributorToken ? <section className="flow-paper"><h2>contributors only</h2><p>Send a letter from this browser first to enter this little gallery.</p></section> : <section className="shared-grid">{letters.map((letter) => <article className={`shared-letter memory-card-${letter.color}`} key={letter.id}><p>“{letter.content}”</p><span>— {letter.is_anonymous ? "anonymous" : letter.sender_name}</span></article>)}{!letters.length && <p>No shared letters have been approved yet.</p>}</section>}</main>;
}
