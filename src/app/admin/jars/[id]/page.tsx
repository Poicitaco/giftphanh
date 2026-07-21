import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CopyLink } from "@/components/copy-link";
import { setGallery, setJarStatus, setMemoryStatus } from "./actions";
import { getSiteCopy } from "@/lib/site-copy-server";

export const dynamic = "force-dynamic";

type Memory = {
  id: string;
  sender_name: string | null;
  is_anonymous: boolean;
  content: string;
  visibility: string;
  moderation_status: string;
  created_at: string;
};

export default async function JarAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/login");

  const { data: jar } = await supabase
    .from("jars")
    .select("id,title,recipient_name,intro,status,slug,recipient_passcode_hint,open_at,allow_contributor_gallery")
    .eq("id", id)
    .maybeSingle();
  if (!jar) notFound();

  const { data } = await supabase
    .from("memories")
    .select("id,sender_name,is_anonymous,content,visibility,moderation_status,created_at")
    .eq("jar_id", id)
    .order("created_at", { ascending: false });
  const memories = (data ?? []) as Memory[];
  const copy = await getSiteCopy();
  const statusLabel = { collecting: copy.status_collecting, locked: copy.status_locked, opened: copy.status_opened } as Record<string, string>;
  const moderationLabel = { pending: copy.status_pending, approved: copy.status_approved, hidden: copy.status_hidden } as Record<string, string>;
  const visibilityLabel = { private: copy.visibility_private, contributors: copy.visibility_contributors } as Record<string, string>;

  return (
    <main className="admin-page scene">
      <div className="admin-shell">
        <Link className="composer-back" href="/admin">← {copy.admin_detail_back}</Link>

        <article className="admin-jar-detail">
          <span>{statusLabel[jar.status] ?? jar.status}</span>
          <h1>{jar.title}</h1>
          <p>{copy.admin_for_recipient} {jar.recipient_name}</p>
          {jar.intro && <blockquote>{jar.intro}</blockquote>}

          <section className="share-links" aria-labelledby="share-title">
            <header><h2 id="share-title">{copy.admin_share_title}</h2><p>{copy.admin_share_intro}</p></header>
            <article className="share-link-card">
              <div><strong>{copy.admin_contributor_link_title}</strong><p>{copy.admin_contributor_link_body}</p><code>/j/{jar.slug}/contribute</code></div>
              <CopyLink path={`/j/${jar.slug}/contribute`} label={copy.admin_contributor_link_label} />
            </article>
            <article className="share-link-card recipient-link-card">
              <div><strong>{copy.admin_recipient_link_title}</strong><p>{copy.admin_recipient_link_body}</p><code>/j/{jar.slug}</code></div>
              <CopyLink path={`/j/${jar.slug}`} label={copy.admin_recipient_link_label} />
            </article>
            <p className="form-note">{copy.admin_hint_prefix} {jar.recipient_passcode_hint || copy.admin_no_hint}. {copy.admin_hint_delivery}</p>
          </section>

          <div className="admin-controls">
            <h2>{copy.admin_controls_title}</h2>
            <div>
              {jar.status !== "collecting" && <form action={setJarStatus.bind(null, id, "collecting")}><button>{copy.admin_collect}</button></form>}
              {jar.status !== "locked" && <form action={setJarStatus.bind(null, id, "locked")}><button>{copy.admin_lock}</button></form>}
              {jar.status !== "opened" && <form action={setJarStatus.bind(null, id, "opened")}><button className="primary">{copy.admin_open}</button></form>}
            </div>
            <form action={setGallery.bind(null, id, String(!jar.allow_contributor_gallery))}><button>{jar.allow_contributor_gallery ? copy.admin_gallery_off : copy.admin_gallery_on}</button></form>
          </div>
        </article>

        <section className="admin-letters">
          <header><h2>{copy.admin_letters_title} ({memories.length})</h2><p>{copy.admin_letters_intro}</p></header>
          {memories.map((memory) => (
            <article key={memory.id}>
              <span>{moderationLabel[memory.moderation_status] ?? memory.moderation_status} · {visibilityLabel[memory.visibility] ?? memory.visibility}</span>
              <h3>{memory.is_anonymous ? copy.recipient_anonymous : memory.sender_name}</h3>
              <p>{memory.content}</p>
              <div>
                <form action={setMemoryStatus.bind(null, id, memory.id, "approved")}><button>{copy.admin_approve}</button></form>
                <form action={setMemoryStatus.bind(null, id, memory.id, "hidden")}><button>{copy.admin_hide}</button></form>
              </div>
            </article>
          ))}
          {!memories.length && <p>{copy.admin_no_letters}</p>}
        </section>
      </div>
    </main>
  );
}
