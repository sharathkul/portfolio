import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";

const hubot = localFont({
  src: "../public/fonts/Hubot-Sans.woff2",
  weight: "200 900",
  variable: "--font-display",
  display: "swap",
});
const plex = localFont({
  src: [
    {
      path: "../public/fonts/IBMPlexSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/IBMPlexSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sharath Kulkarni — Inside the build",
  description:
    "Inside the products, teams, and decisions behind my work in healthcare AI, product development, and operations.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${hubot.variable} ${plex.variable}`}>{children}</body>
    </html>
  );
}
