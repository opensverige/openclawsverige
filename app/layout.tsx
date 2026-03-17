import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE_PATH,
  absoluteUrl,
} from "@/lib/seo";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const TITLE = "opensverige - Sveriges community for AI-agenter";
const DESCRIPTION =
  "Oppet community for folk som bygger AI-agenter i Sverige. OpenClaw, CrewAI, MCP och multi-agent. Discord + IRL meetups. Gratis och oppen kallkod.";
const OG_IMAGE_URL = absoluteUrl(DEFAULT_OG_IMAGE_PATH);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "AI agenter Sverige",
    "OpenClaw",
    "CrewAI",
    "MCP",
    "multi-agent system",
    "AI community Sverige",
    "AI meetup Stockholm",
    "AI agents Swedish",
    "oppen kallkod AI",
    "Fortnox AI integration",
    "svenska AI-builders",
  ],
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: TITLE,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        alt: TITLE,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/icon.png"),
  description: "Sveriges community for AI-agenter",
  sameAs: [
    "https://discord.gg/CSphbTk8En",
    "https://www.facebook.com/groups/2097332881024571/",
    "https://www.linkedin.com/groups/9544657/",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "info@opensverige.se",
      contactType: "Customer Service",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable} scroll-smooth`}
      style={{ backgroundColor: "#0a0a0a", color: "#e8e0d4" }}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className="font-sans antialiased"
        style={{ backgroundColor: "#0a0a0a", color: "#e8e0d4" }}
      >
        <div
          style={{
            backgroundColor: "#0a0a0a",
            color: "#e8e0d4",
            minHeight: "100vh",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
