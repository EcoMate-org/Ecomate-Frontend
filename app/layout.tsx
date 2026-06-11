import type { Metadata } from "next";
import "./globals.css";


import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoMate AI - Digital Recycling Marketplace",
  description:
    "EcoMate AI is a digital recycling community and marketplace connecting users, NGOs, and companies to solve global waste challenges through AI-powered material scanning, art creation, and sustainable trading.",
  keywords: [
    "recycling",
    "e-waste",
    "sustainability",
    "AI",
    "marketplace",
    "environment",
    "UN SDG",
  ],
  authors: [{ name: "EcoMate AI Team" }],
  openGraph: {
    title: "EcoMate AI - Digital Recycling Marketplace",
    description:
      "Join the movement to transform waste into value. AI-powered recycling community.",
    type: "website",
  },
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