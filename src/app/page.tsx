import { WelcomeScene } from "@/components/welcome-scene";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data } = await (await createClient()).auth.getClaims();
  return <WelcomeScene authenticated={Boolean(data?.claims)} />;
}
