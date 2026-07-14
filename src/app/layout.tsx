import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Space_Mono,
  Waiting_for_the_Sunrise,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const sunrise = Waiting_for_the_Sunrise({
  variable: "--font-sunrise",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "A little jar of your happy moments",
  description: "Fold each happy memory into a star.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${spaceMono.variable} ${sunrise.variable}`}>
        {children}
      </body>
    </html>
  );
}
