import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { NAME, PERSON_ID, PROFILES, SITE, SITE_DESCRIPTION, SITE_TITLE, WEBSITE_ID } from "@/lib/site";
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

// On every page: the site and the person it's about. Other pages point at these by @id —
// the homepage's ProfilePage, and the author/provider of each service and case study.
// alternateName tells search engines "Bekre" and "Bekretsion" are the same person; sameAs
// links the profiles elsewhere that belong to him.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE,
      name: NAME,
      inLanguage: "en",
      publisher: { "@id": PERSON_ID },
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: NAME,
      givenName: "Bekretsion",
      familyName: "Seyoum",
      alternateName: ["Bekre", "Bekretsion"],
      jobTitle: "Software Engineer",
      description:
        "Backend software engineer in Addis Ababa, Ethiopia, building real-time APIs, AI voice receptionists in Amharic and 95+ languages, and business automation.",
      url: SITE,
      image: `${SITE}/me.jpg`,
      email: "mailto:bekretsionseyoum4@gmail.com",
      address: { "@type": "PostalAddress", addressLocality: "Addis Ababa", addressCountry: "ET" },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Hope Enterprise University College",
        url: "https://www.heuc.edu.et/",
      },
      award: ["National finalist, ALX Ethiopia × Kuriftu Hospitality Hackathon 2026"],
      knowsAbout: [
        "Backend development",
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "Real-time systems",
        "WebSockets",
        "Voice AI",
        "ElevenLabs",
        "Vapi",
        "Business automation",
        "n8n",
        "Amharic voice assistants",
      ],
      sameAs: [PROFILES.linkedin, PROFILES.github, PROFILES.youtube],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={structuredData} />
        {children}
      </body>
    </html>
  );
}
