import Link from "next/link";
import { EditLetterForm } from "@/components/edit-letter-form";
import { AmbientStarField } from "@/components/ambient-star-field";
import { getSiteCopy } from "@/lib/site-copy-server";
export default async function EditPage({ params }: { params: Promise<{ slug: string; memoryId: string }> }) { const { slug, memoryId } = await params; const copy = await getSiteCopy(); return <main className="flow-page scene"><AmbientStarField /><Link className="composer-back" href={`/j/${slug}/contribute`}>← {copy.edit_back}</Link><header className="flow-heading"><p>{copy.edit_page_eyebrow}</p><h1>{copy.edit_page_title}</h1><p>{copy.edit_page_intro}</p></header><EditLetterForm slug={slug} memoryId={memoryId} /></main>; }
