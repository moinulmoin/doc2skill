import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@/components/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doc2Skill - Transform Documentation into Claude AI Skills",
  description: "Automatically convert any documentation website into a Claude AI skill in minutes. Built by Moinul Moin and Yusuf Karaaslan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* not working */}
        <Analytics/>
      </body>
      {/* Umami web analytics for visitor statistics */}
      <Script
        defer
        src="https://umami.moinulmoin.com/script.js"
        data-website-id="d8600839-5ab5-4257-a2c5-71225affbb04"
        strategy="afterInteractive"
      />
    </html>
  );
}
