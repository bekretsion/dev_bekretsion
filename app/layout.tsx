import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bekretsion.com"),
  title: "Bekretsion",
  description: "Portfolio — projects, live and in motion.",
  openGraph: {
    title: "Bekretsion",
    description: "Portfolio — projects, live and in motion.",
    url: "https://bekretsion.com",
    siteName: "Bekretsion",
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
      <body>{children}</body>
    </html>
  );
}
