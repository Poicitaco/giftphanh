import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AmbientStarField } from "@/components/ambient-star-field";
import { createClient } from "@/lib/supabase/server";
import { defaultSiteCopy, siteCopyGroups, type SiteCopyKey } from "@/lib/site-copy";
import { getSiteCopy, isSuperAdminEmail } from "@/lib/site-copy-server";
import { updateSiteCopy } from "./actions";

export const dynamic = "force-dynamic";

const humanize = (key: string) => key.replace(/^[^_]+_/, "").replaceAll("_", " ");

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  if (!isSuperAdminEmail(data.claims.email)) notFound();

  const copy = await getSiteCopy();
  const keys = Object.keys(defaultSiteCopy) as SiteCopyKey[];
  const saved = (await searchParams).saved === "1";

  return <main className="admin-page scene">
    <AmbientStarField />
    <div className="admin-shell settings-shell">
      <Link className="composer-back" href="/admin">← {copy.settings_back}</Link>
      <header className="admin-heading"><h1>{copy.settings_title}</h1><p>{copy.settings_intro}</p></header>
      {saved && <p className="settings-success" role="status">{copy.settings_saved}</p>}
      <form action={updateSiteCopy} className="settings-form">
        {siteCopyGroups.map(([title, ...prefixes]) => {
          const groupKeys = keys.filter((key) => prefixes.some((prefix) => key.startsWith(prefix)));
          return <fieldset key={title}><legend>{title}</legend>{groupKeys.map((key) => <label key={key}>
            <span>{humanize(key)} <code>{key}</code></span>
            {copy[key].length > 90 ? <textarea defaultValue={copy[key]} maxLength={2000} name={key} required rows={3} /> : <input defaultValue={copy[key]} maxLength={2000} name={key} required />}
          </label>)}</fieldset>;
        })}
        <button className="flow-submit" type="submit">{copy.settings_submit}</button>
      </form>
    </div>
  </main>;
}
