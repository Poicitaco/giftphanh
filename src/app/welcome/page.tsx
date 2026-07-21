import Link from "next/link";
import { AmbientStarField } from "@/components/ambient-star-field";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const supabase = await createClient();
  // Lấy chiếc lọ duy nhất trong hệ thống thông qua RPC
  const { data: rawJars } = await supabase.rpc("get_single_gift_jar");
  const jar = rawJars?.[0];

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#faf8f5] text-[#2c3e50] px-6">
      <AmbientStarField full />
      <section className="relative z-10 w-full max-w-md mx-auto text-center flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        <div className="space-y-4">
          <p className="font-serif italic text-lg opacity-70 tracking-wide text-gray-500">
            A little jar of stars for...
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-[#1a2b3c] leading-tight">
            <span>{jar?.recipient_name || "You"}</span>
          </h1>
        </div>
        
        <p className="text-[1.05rem] leading-relaxed opacity-80 max-w-[280px] mx-auto text-gray-600">
          We collected some of our favorite memories and words for you.
          Open the jar when you need a smile.
        </p>
        
        <div className="pt-8">
          <Link 
            href="/gift"
            className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-[#1a2b3c] text-white text-lg font-medium tracking-wide transition-transform active:scale-95 shadow-md hover:shadow-lg"
          >
            Open the Jar <span className="ml-2">★</span>
          </Link>
        </div>
        
      </section>
    </main>
  );
}
