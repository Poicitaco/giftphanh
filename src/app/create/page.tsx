import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateJarForm } from "@/components/create-jar-form";
import { AmbientStarField } from "@/components/ambient-star-field";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  return (
    <main className="admin-page scene">
      <AmbientStarField />
      <div className="admin-shell">
        <Link className="composer-back" href="/admin"><span aria-hidden="true">←</span> your jars</Link>
        <header className="admin-heading">
          <h1>create a jar</h1>
          <p>one recipient, many friends, and a secret only they can open.</p>
        </header>
        <CreateJarForm />
      </div>
    </main>
  );
}
