"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveProfile(formData: FormData) {
  const displayName = formData.get("displayName")?.toString().trim();
  
  if (!displayName || displayName.length < 1 || displayName.length > 100) {
    return { error: "Tên hiển thị không hợp lệ." };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    return { error: "Bạn chưa đăng nhập." };
  }

  const { error } = await supabase.from("profiles").upsert({
    id: authData.user.id,
    display_name: displayName,
    updated_at: new Date().toISOString()
  });

  if (error) {
    console.error(error);
    return { error: "Có lỗi xảy ra khi lưu tên của bạn." };
  }

  // Redirect to write page after successful setup
  redirect("/write");
}
