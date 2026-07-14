import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Mali,
  Space_Mono,
  Waiting_for_the_Sunrise,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
});

const sunrise = Waiting_for_the_Sunrise({
  variable: "--font-sunrise",
  subsets: ["latin"],
  weight: "400",
});

const mali = Mali({
  variable: "--font-mali",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "A little jar of your happy moments",
  description: "Fold each happy memory into a star.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${cormorant.variable} ${spaceMono.variable} ${sunrise.variable} ${mali.variable}`}>
        {children}
      </body>
    </html>
  );
}
