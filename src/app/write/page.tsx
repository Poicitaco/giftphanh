import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContributorForm } from "@/components/contributor-form";
import { AmbientStarField } from "@/components/ambient-star-field";
import { getSiteCopy } from "@/lib/site-copy-server";

export const dynamic = "force-dynamic";

export default async function ContributePage() {
  const supabase = await createClient();
  
  // Require authentication to write a letter
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    redirect("/login?next=/write");
  }

  // Enforce profile setup
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", authData.user.id).single();
  if (!profile?.display_name) {
    redirect("/setup-profile");
  }

  // Get the single jar
  const { data: rawJars } = await supabase.rpc("get_single_gift_jar");
  const rawJar = rawJars?.[0];
  if (!rawJar) notFound();
  const slug = rawJar.slug;

  const { data, error } = await supabase.rpc("get_public_jar", { p_slug: slug });
  if (error) console.error("get_public_jar failed", { code: error.code, message: error.message });
  
  const jar = data?.[0]; 
  if (!jar) notFound();
  
  const accepting = ["draft", "collecting"].includes(jar.status);
  const copy = await getSiteCopy();
  
  return (
    <main className="flow-page scene">
      <AmbientStarField />
      <Link className="composer-back" href="/">← {copy.contribute_back}</Link>
      
      <header className="flow-heading">
        <p>{copy.contribute_writing_for}</p>
        <h1>{jar.recipient_name}</h1>
        <h2>{jar.title}</h2>
        {jar.intro && <p>{jar.intro}</p>}
      </header>
      
      {accepting ? (
        <ContributorForm slug={slug} galleryEnabled={jar.allow_contributor_gallery} displayName={profile.display_name} />
      ) : (
        <section className="flow-paper">
          <h2>{copy.contribute_closed_title}</h2>
          <p>{copy.contribute_closed_body}</p>
        </section>
      )}
    </main>
  );
}
