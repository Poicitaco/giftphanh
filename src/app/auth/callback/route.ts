import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_ADMIN = ["itentad.work@gmail.com"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextUrl = url.searchParams.get("next") || "/write";

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Admin di thang vao trang quan tri
      if (EMAIL_ADMIN.includes((user.email ?? "").toLowerCase())) {
        return NextResponse.redirect(new URL("/admin", url.origin));
      }

      // Kiem tra da co profile chua
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      // Neu chua co ten hien thi, cho setup truoc
      if (!profile?.display_name) {
        return NextResponse.redirect(new URL(`/setup-profile?next=${encodeURIComponent(nextUrl)}`, url.origin));
      }

      // Co profile roi, vao thang trang dich
      return NextResponse.redirect(new URL(nextUrl, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth", url.origin));
}
