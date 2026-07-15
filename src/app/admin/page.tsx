import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteCopy, isSuperAdminEmail } from "@/lib/site-copy-server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/login");
  const copy = await getSiteCopy();
  const superAdmin = isSuperAdminEmail(claimsData.claims.email);
  const statusLabel = { collecting: copy.status_collecting, locked: copy.status_locked, opened: copy.status_opened } as Record<string, string>;

  const { data: jars } = await supabase
    .from("jars")
    .select("id,title,recipient_name,status,created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="admin-page scene">
      <div className="admin-shell">
        <Link className="composer-back" href="/"><span aria-hidden="true">←</span> {copy.admin_back_home}</Link>
        <header className="admin-heading admin-heading-row">
          <div><h1>{copy.admin_title}</h1><p>{copy.admin_intro}</p>{superAdmin && <Link className="text-link" href="/admin/settings">{copy.admin_settings}</Link>}</div>
          <Link className="paper-button" href="/create">{copy.admin_create}</Link>
        </header>
        <section className="admin-jar-grid" aria-label={copy.admin_jars_label}>
          {jars?.map((jar) => (
            <Link className="admin-jar-card" href={`/admin/jars/${jar.id}`} key={jar.id}>
              <span>{statusLabel[jar.status] ?? jar.status}</span>
              <h2>{jar.title}</h2>
              <p>{copy.admin_for} {jar.recipient_name}</p>
            </Link>
          ))}
          {!jars?.length && <p className="admin-empty">{copy.admin_empty}</p>}
        </section>
      </div>
    </main>
  );
}
