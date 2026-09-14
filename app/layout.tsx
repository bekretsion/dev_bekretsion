import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bekretison",
  description: "Portfolio — projects, live and in motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
