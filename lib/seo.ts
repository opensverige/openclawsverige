import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://opensverige.se";
const VERCEL_ENV = process.env.VERCEL_ENV;
const VERCEL_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (VERCEL_ENV === "production" ? DEFAULT_SITE_URL : VERCEL_HOST ?? DEFAULT_SITE_URL);

export const SITE_NAME = "opensverige";
export const DEFAULT_OG_IMAGE_PATH = "/assets/1200x630_opensverige.png";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

function buildImage(path: string, alt: string) {
  return {
    url: absoluteUrl(path),
    width: 1200,
    height: 630,
    alt,
    type: "image/png",
  } as const;
}

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
  imageAlt?: string;
  type?: "website" | "article";
};

export function buildPageMetadata({
  title,
  description,
  path,
  imagePath = DEFAULT_OG_IMAGE_PATH,
  imageAlt = title,
  type = "website",
}: BuildPageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const image = buildImage(imagePath, imageAlt);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: "sv_SE",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{
        url: image.url,
        alt: image.alt,
      }],
    },
  };
}
