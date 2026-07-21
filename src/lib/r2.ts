// Upload anh len R2 dung fetch native (undici) + AWS Sig V4 thu cong
// Tranh hoan toan loi SSL cua AWS SDK HTTP handler tren Windows

import crypto from "node:crypto";

const tenMaKhoanh = process.env.CLOUDFLARE_R2_ACCOUNT_ID!;
const tenBucket = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
const urlGocR2 = `https://${tenMaKhoanh}.r2.cloudflarestorage.com`;

function kyHmacSha256(khoaKy: Buffer | string, duLieu: string): Buffer {
  return crypto.createHmac("sha256", khoaKy).update(duLieu, "utf8").digest();
}

function maHoaSha256Hex(duLieu: Buffer | string): string {
  return crypto.createHash("sha256").update(duLieu).digest("hex");
}

function taoKhoaKy(ngay: string): Buffer {
  const buoc1 = kyHmacSha256(`AWS4${secretKey}`, ngay);
  const buoc2 = kyHmacSha256(buoc1, "auto");
  const buoc3 = kyHmacSha256(buoc2, "s3");
  return kyHmacSha256(buoc3, "aws4_request");
}

// Upload truc tiep len R2 dung fetch + AWS Sig V4 thu cong
export async function uploadAnhLenR2(
  duLieuAnh: Buffer,
  tenFile: string,
  loaiFile: string
): Promise<string | null> {
  const khoaObject = `letters/${Date.now()}-${tenFile.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const urlCong = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${khoaObject}`;
  const urlUpload = `${urlGocR2}/${tenBucket}/${khoaObject}`;

  try {
    const gioDayDu = new Date();
    const chuoiNgayGio = gioDayDu.toISOString().replace(/[:-]/g, "").slice(0, 15) + "Z";
    const chuoiNgay = chuoiNgayGio.slice(0, 8);

    const bangamHash = maHoaSha256Hex(duLieuAnh);
    const host = `${tenMaKhoanh}.r2.cloudflarestorage.com`;

    // Tao Canonical Request
    const canonicalRequest = [
      "PUT",
      `/${tenBucket}/${khoaObject}`,
      "", // khong co query string
      `content-type:${loaiFile}\nhost:${host}\nx-amz-content-sha256:${bangamHash}\nx-amz-date:${chuoiNgayGio}\n`,
      "content-type;host;x-amz-content-sha256;x-amz-date",
      bangamHash,
    ].join("\n");

    // Tao String to Sign
    const phamVi = `${chuoiNgay}/auto/s3/aws4_request`;
    const chuoiKy = [
      "AWS4-HMAC-SHA256",
      chuoiNgayGio,
      phamVi,
      maHoaSha256Hex(canonicalRequest),
    ].join("\n");

    // Ky
    const khoaKy = taoKhoaKy(chuoiNgay);
    const chuKy = kyHmacSha256(khoaKy, chuoiKy).toString("hex");

    const authorization =
      `AWS4-HMAC-SHA256 Credential=${accessKey}/${phamVi}, ` +
      `SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, ` +
      `Signature=${chuKy}`;

    // Dung fetch native (undici) de PUT - tranh loi SSL cua AWS SDK
    const ketQua = await fetch(urlUpload, {
      method: "PUT",
      headers: {
        "Authorization": authorization,
        "Content-Type": loaiFile,
        "x-amz-content-sha256": bangamHash,
        "x-amz-date": chuoiNgayGio,
        "Host": host,
      },
      body: duLieuAnh,
    });

    if (!ketQua.ok) {
      const chiTiet = await ketQua.text();
      console.error("R2 upload failed:", ketQua.status, chiTiet);
      return null;
    }

    return urlCong;
  } catch (loi) {
    console.error("R2 upload error:", loi);
    return null;
  }
}
