import Link from "next/link";
import { EditLetterForm } from "@/components/edit-letter-form";
export default async function EditPage({ params }: { params: Promise<{ slug: string; memoryId: string }> }) { const { slug, memoryId } = await params; return <main className="flow-page scene"><Link className="composer-back" href={`/j/${slug}/contribute`}>← contribution page</Link><header className="flow-heading"><h1>your folded letter</h1><p>Only this link and your private edit code can open the editor.</p></header><EditLetterForm slug={slug} memoryId={memoryId} /></main>; }
