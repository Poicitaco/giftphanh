import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AmbientStarField } from "@/components/ambient-star-field";
import { saveProfile } from "./actions";

export default async function SetupProfilePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData?.user) {
    redirect("/login");
  }

  // If they already have a profile, they can still change it in settings, 
  // but if they access setup-profile manually, we can let them update it or redirect to /write
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", authData.user.id).single();

  return (
    <main className="auth-page scene">
      <AmbientStarField />
      <section className="auth-content">
        <h1>{profile?.display_name ? "Thay đổi tên của bạn" : "Bạn tên là gì?"}</h1>
        <p>Vui lòng nhập tên của bạn. Tên này sẽ hiển thị trên những bức thư bạn gửi và không thể thay đổi lúc gửi thư.</p>
        
        <form className="auth-paper" action={saveProfile}>
          <label htmlFor="display-name">Tên hiển thị</label>
          <input 
            id="display-name" 
            name="displayName" 
            maxLength={100} 
            placeholder="Ví dụ: Hoàng Anh..." 
            defaultValue={profile?.display_name || ""} 
            required 
            autoFocus
          />
          <button type="submit">Lưu tên và tiếp tục</button>
        </form>
      </section>
    </main>
  );
}
