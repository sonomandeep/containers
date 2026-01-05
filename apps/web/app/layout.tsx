import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {Logo} from "@/components/core/logo"
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
  title: "Containers - mando.sh",
  description: "Containers management platform.",
  icons: {
    icon: [
      {
        url: "icon.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "icon2.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body
      >
        {children}
      </body>
    </html>
  );
}
