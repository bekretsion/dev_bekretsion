import type { Metadata } from "next";
import { NAME, SITE, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  authors: [{ name: NAME, url: SITE }],
  creator: NAME,
  openGraph: {
    type: "profile",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE,
    siteName: NAME,
    locale: "en_US",
    firstName: "Bekretsion",
    lastName: "Seyoum",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

// The site-wide structured data (WebSite + Person) lives in components/SiteJsonLd, rendered by
// the homepage and PageShell rather than here, so /work can stay free of contact details.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
