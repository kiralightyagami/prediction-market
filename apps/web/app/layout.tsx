import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "#lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Polymark — Prediction Market",
  description:
    "Trade live prediction markets. Buy and sell shares on real-world outcomes with transparent orderbooks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", figtree.variable)}>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-inter)]`}
      >
        {children}
      </body>
    </html>
  );
}
