import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter, Geist_Mono } from "next/font/google";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import "./globals.css";
import "@/styles/cmm.style.css";
import "@/styles/header.css";
import "@/styles/layout.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"]
});

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "물알림단 지하수위 예측",
    template: "%s | 물알림단 지하수위 예측",
  },
  description: "지하수 수위를 예측하고 시각화하는 서비스",
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${interSans.variable} ${geistMono.variable} antialiased relative tracking-tight break-keep`}
      >
        <Header/>
        {children}
        <Footer />
      </body>
    </html>
  );
}
