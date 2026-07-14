import Link from "next/link";
import { EditLetterForm } from "@/components/edit-letter-form";
import { AmbientStarField } from "@/components/ambient-star-field";
export default async function EditPage({ params }: { params: Promise<{ slug: string; memoryId: string }> }) { const { slug, memoryId } = await params; return <main className="flow-page scene"><AmbientStarField /><Link className="composer-back" href={`/j/${slug}/contribute`}>← quay lại chiếc lọ</Link><header className="flow-heading"><p>một góc chỉ mình bạn biết</p><h1>Lá thư đã gấp</h1><p>Chỉ đường dẫn này cùng mật mã riêng mới mở được phần chỉnh sửa.</p></header><EditLetterForm slug={slug} memoryId={memoryId} /></main>; }
