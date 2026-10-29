import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sharath Kulkarni | Healthcare product & operations",
  description:
    "I build healthcare products and lead the teams that make them work. Product development, operations leadership, and client delivery.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
