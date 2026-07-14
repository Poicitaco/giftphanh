import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CopyLink } from "@/components/copy-link";
import { setGallery, setJarStatus, setMemoryStatus } from "./actions";

export const dynamic = "force-dynamic";
type Memory = { id: string; sender_name: string | null; is_anonymous: boolean; content: string; visibility: string; moderation_status: string; created_at: string };
export default async function JarAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/login");
  const { data: jar } = await supabase.from("jars").select("id,title,recipient_name,intro,status,slug,recipient_passcode_hint,open_at,allow_contributor_gallery").eq("id", id).maybeSingle();
  if (!jar) notFound();
  const { data } = await supabase.from("memories").select("id,sender_name,is_anonymous,content,visibility,moderation_status,created_at").eq("jar_id", id).order("created_at", { ascending: false });
  const memories = (data ?? []) as Memory[];
  return <main className="admin-page scene"><div className="admin-shell"><Link className="composer-back" href="/admin">← your jars</Link><article className="admin-jar-detail"><span>{jar.status}</span><h1>{jar.title}</h1><p>for {jar.recipient_name}</p>{jar.intro && <blockquote>{jar.intro}</blockquote>}<div className="admin-link-row"><code>/j/{jar.slug}/contribute</code><CopyLink path={`/j/${jar.slug}/contribute`} label="contributor link" /></div><div className="admin-link-row"><code>/j/{jar.slug}</code><CopyLink path={`/j/${jar.slug}`} label="recipient link" /></div><p className="form-note">passcode hint: {jar.recipient_passcode_hint || "no hint"}</p><div className="admin-controls"><h2>jar controls</h2><div>{jar.status !== "collecting" && <form action={setJarStatus.bind(null, id, "collecting")}><button>collect letters</button></form>}{jar.status !== "locked" && <form action={setJarStatus.bind(null, id, "locked")}><button>seal jar</button></form>}{jar.status !== "opened" && <form action={setJarStatus.bind(null, id, "opened")}><button className="primary">open for recipient</button></form>}</div><form action={setGallery.bind(null, id, String(!jar.allow_contributor_gallery))}><button>{jar.allow_contributor_gallery ? "disable" : "enable"} contributor gallery</button></form></div></article><section className="admin-letters"><header><h2>letters ({memories.length})</h2><p>Approve a letter before it becomes a star in the recipient jar.</p></header>{memories.map((memory) => <article key={memory.id}><span>{memory.moderation_status} · {memory.visibility}</span><h3>{memory.is_anonymous ? "anonymous" : memory.sender_name}</h3><p>{memory.content}</p><div><form action={setMemoryStatus.bind(null, id, memory.id, "approved")}><button>approve</button></form><form action={setMemoryStatus.bind(null, id, memory.id, "hidden")}><button>hide</button></form></div></article>)}{!memories.length && <p>No letters yet. Share the contributor link with your friends.</p>}</section></div></main>;
}
