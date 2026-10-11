import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-heading", display: "swap", preload: false });
const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap", preload: false });

export const metadata: Metadata = {
  title: "FarmIQ | Dairy & Livestock Management",
  description: "One place for herd, production, health, and finance on your farm.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
