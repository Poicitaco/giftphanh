import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadAnhLenR2 } from "@/lib/r2";

const LOAI_CHO_PHEP = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// API: Nhan anh tu browser, upload len R2 tu phia server
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: thongTinAuth } = await supabase.auth.getUser();
  if (!thongTinAuth?.user) {
    return NextResponse.json({ error: "Vui long dang nhap." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Khong tim thay file." }, { status: 400 });
    }
    if (!LOAI_CHO_PHEP.includes(file.type)) {
      return NextResponse.json({ error: "Chi chap nhan anh JPG, PNG, GIF hoac WEBP." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Anh khong duoc vuot qua 5MB." }, { status: 400 });
    }

    const mangDuLieu = Buffer.from(await file.arrayBuffer());
    const url = await uploadAnhLenR2(mangDuLieu, file.name, file.type);

    if (!url) {
      return NextResponse.json({ error: "Upload anh that bai, thu lai nhe." }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (loi) {
    console.error("Upload API error:", loi);
    return NextResponse.json({ error: "Co loi xay ra." }, { status: 500 });
  }
}
