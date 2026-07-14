import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/login");

  const { data: jars } = await supabase
    .from("jars")
    .select("id,title,recipient_name,status,created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="admin-page scene">
      <div className="admin-shell">
        <Link className="composer-back" href="/"><span aria-hidden="true">←</span> home</Link>
        <header className="admin-heading admin-heading-row">
          <div><h1>your jars</h1><p>small collections made for someone special.</p></div>
          <Link className="paper-button" href="/create">+ create a jar</Link>
        </header>
        <section className="admin-jar-grid" aria-label="Your jars">
          {jars?.map((jar) => (
            <Link className="admin-jar-card" href={`/admin/jars/${jar.id}`} key={jar.id}>
              <span>{jar.status}</span>
              <h2>{jar.title}</h2>
              <p>for {jar.recipient_name}</p>
            </Link>
          ))}
          {!jars?.length && <p className="admin-empty">no jars yet — create the first one.</p>}
        </section>
      </div>
    </main>
  );
}
