import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { OpenPanelComponent } from '@openpanel/nextjs';
import "./globals.css";

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
        <OpenPanelComponent
          clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID || ''}
          apiUrl="/api/op"
          trackOutgoingLinks={true}
          trackScreenViews={false}
        />
        {children}
      </body>
    </html>
  );
}
