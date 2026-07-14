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
  return <main className="flow-page scene"><AmbientStarField /><Link className="composer-back" href="/">← về trang chủ</Link><header className="flow-heading"><p>bạn đang viết cho</p><h1>{jar.recipient_name}</h1><h2>{jar.title}</h2>{jar.intro && <p>{jar.intro}</p>}</header>{accepting ? <ContributorForm slug={slug} galleryEnabled={jar.allow_contributor_gallery} /> : <section className="flow-paper"><h2>Chiếc lọ đã ngừng nhận thư</h2><p>Chủ lọ đã niêm phong món quà dành cho {jar.recipient_name} rồi.</p></section>}</main>;
}
