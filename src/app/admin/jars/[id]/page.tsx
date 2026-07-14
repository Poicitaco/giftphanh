import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CopyLink } from "@/components/copy-link";
import { setGallery, setJarStatus, setMemoryStatus } from "./actions";

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

  return (
    <main className="admin-page scene">
      <div className="admin-shell">
        <Link className="composer-back" href="/admin">← các chiếc lọ</Link>

        <article className="admin-jar-detail">
          <span>{jar.status}</span>
          <h1>{jar.title}</h1>
          <p>dành cho {jar.recipient_name}</p>
          {jar.intro && <blockquote>{jar.intro}</blockquote>}

          <section className="share-links" aria-labelledby="share-title">
            <header><h2 id="share-title">gửi đúng link cho đúng người</h2><p>Hai link này có quyền khác nhau, đừng gửi nhầm link người nhận vào nhóm.</p></header>
            <article className="share-link-card">
              <div><strong>1. Link cho nhóm bạn viết thư</strong><p>Gửi vào nhóm. Mỗi người chỉ sửa được thư của chính mình.</p><code>/j/{jar.slug}/contribute</code></div>
              <CopyLink path={`/j/${jar.slug}/contribute`} label="link cho người viết" />
            </article>
            <article className="share-link-card recipient-link-card">
              <div><strong>2. Link riêng cho người nhận</strong><p>Chỉ gửi khi bạn đã duyệt thư và bấm mở lọ.</p><code>/j/{jar.slug}</code></div>
              <CopyLink path={`/j/${jar.slug}`} label="link cho người nhận" />
            </article>
            <p className="form-note">Gợi ý mật mã: {jar.recipient_passcode_hint || "không có"}. Hãy gửi mật mã riêng qua Messenger hoặc Zalo.</p>
          </section>

          <div className="admin-controls">
            <h2>điều khiển chiếc lọ</h2>
            <div>
              {jar.status !== "collecting" && <form action={setJarStatus.bind(null, id, "collecting")}><button>nhận thêm thư</button></form>}
              {jar.status !== "locked" && <form action={setJarStatus.bind(null, id, "locked")}><button>niêm phong lọ</button></form>}
              {jar.status !== "opened" && <form action={setJarStatus.bind(null, id, "opened")}><button className="primary">mở lọ cho người nhận</button></form>}
            </div>
            <form action={setGallery.bind(null, id, String(!jar.allow_contributor_gallery))}><button>{jar.allow_contributor_gallery ? "tắt" : "bật"} thư chia sẻ giữa người viết</button></form>
          </div>
        </article>

        <section className="admin-letters">
          <header><h2>thư đã nhận ({memories.length})</h2><p>Duyệt thư để biến nó thành một ngôi sao trong lọ người nhận.</p></header>
          {memories.map((memory) => (
            <article key={memory.id}>
              <span>{memory.moderation_status} · {memory.visibility}</span>
              <h3>{memory.is_anonymous ? "ẩn danh" : memory.sender_name}</h3>
              <p>{memory.content}</p>
              <div>
                <form action={setMemoryStatus.bind(null, id, memory.id, "approved")}><button>duyệt</button></form>
                <form action={setMemoryStatus.bind(null, id, memory.id, "hidden")}><button>ẩn</button></form>
              </div>
            </article>
          ))}
          {!memories.length && <p>Chưa có thư. Hãy sao chép link cho người viết và gửi vào nhóm bạn.</p>}
        </section>
      </div>
    </main>
  );
}
