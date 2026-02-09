import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Or use Geist Sans if preferred
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Movie Matcher",
  description: "Find the perfect movie together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
