
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trampoline Coach AI",
  description: "An AI-powered chat bot for trampoline gymnastics, providing expert advice on routine construction, execution, and the 2025-2028 Code of Points.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
