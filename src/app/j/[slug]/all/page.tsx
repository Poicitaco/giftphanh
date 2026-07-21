import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecipientStarGallery, type GalleryStar } from "@/components/recipient-star-gallery";

export const dynamic = "force-dynamic";

export default async function RecipientGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_jar", { p_slug: slug });
  
  if (error) console.error("get_public_jar failed", { code: error.code, message: error.message });
  const jar = data?.[0];
  if (!jar) notFound();

  const sessionToken = (await cookies()).get(`jar-recipient-${slug}`)?.value;
  if (!sessionToken) redirect(`/j/${slug}`); // Not authenticated, go back to unlock

  const result = await supabase.rpc("get_recipient_all_stars", { p_slug: slug, p_session_token: sessionToken });
  if (result.error || !result.data) {
    redirect(`/j/${slug}`); // Maybe session expired or error
  }

  const stars = (result.data ?? []) as GalleryStar[];

  return <RecipientStarGallery slug={slug} recipientName={jar.recipient_name} stars={stars} />;
}
