import type { Metadata } from "next";
import "./globals.css";

// Canonical host. Vercel makes www the canonical address and 308-redirects the apex to it,
// so every absolute URL search engines see must use www too.
const SITE = "https://www.bekretsion.com";

const NAME = "Bekretsion Seyoum";
const TITLE = "Bekretsion Seyoum (Bekre) — Software Engineer & Automation, Ethiopia";
const DESCRIPTION =
  "Bekretsion Seyoum (Bekre): software engineer in Addis Ababa, Ethiopia. Real-time backends, voice AI receptionists and business automation. Open to remote work.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  authors: [{ name: NAME, url: SITE }],
  creator: NAME,
  openGraph: {
    type: "profile",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE,
    siteName: NAME,
    locale: "en_US",
    firstName: "Bekretsion",
    lastName: "Seyoum",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

// Tells search engines who this page is about, that "Bekre" and "Bekretsion" are the same
// person, and which profiles elsewhere belong to him. Google reads ProfilePage → Person.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: NAME,
      inLanguage: "en",
      publisher: { "@id": `${SITE}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE}/#page`,
      url: SITE,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { "@id": `${SITE}/#website` },
      mainEntity: { "@id": `${SITE}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE}/#person`,
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
      knowsAbout: [
        "Backend development",
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "Real-time systems",
        "WebSockets",
        "Voice AI",
        "ElevenLabs",
        "Business automation",
        "n8n",
        "Amharic voice assistants",
      ],
      sameAs: [
        "https://www.linkedin.com/in/bekretsion-seyoum",
        "https://github.com/bekretsion",
        "https://www.youtube.com/@bekretsion",
      ],
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  );
}
