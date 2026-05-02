import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "MedGenesis",
  description: "Pakistan's first AI based health system",
};

function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-black text-white">
      <span className="font-thin text-xl">MedGenesis</span>
      <nav className="flex gap-6">
        <Link href="/test">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/doctors">Doctors</Link>
      </nav>
      <Button>Get Started</Button>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}