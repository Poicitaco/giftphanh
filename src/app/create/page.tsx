import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateJarForm } from "@/components/create-jar-form";
import { AmbientStarField } from "@/components/ambient-star-field";
import { createClient } from "@/lib/supabase/server";
import { getSiteCopy } from "@/lib/site-copy-server";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  const copy = await getSiteCopy();

  return (
    <main className="admin-page scene">
      <AmbientStarField />
      <div className="admin-shell">
        <Link className="composer-back" href="/admin"><span aria-hidden="true">←</span> {copy.create_back}</Link>
        <header className="admin-heading">
          <h1>{copy.create_title}</h1>
          <p>{copy.create_intro}</p>
        </header>
        <CreateJarForm />
      </div>
    </main>
  );
}
