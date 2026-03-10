import { NextRequest, NextResponse } from "next/server";

const PRIMARY_HOST = (() => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
})();

export function middleware(request: NextRequest) {
  const isProduction = process.env.VERCEL_ENV === "production";
  if (!isProduction) {
    return NextResponse.next();
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = forwardedHost ?? request.headers.get("host");
  const hostname = hostHeader
    ? hostHeader.split(",")[0].trim().split(":")[0]
    : null;
  if (!hostname || (PRIMARY_HOST && hostname === PRIMARY_HOST)) {
    return NextResponse.next();
  }

  const isVercelHost = hostname.endsWith(".vercel.app");

  if (isVercelHost && PRIMARY_HOST) {
    const url = request.nextUrl.clone();
    url.hostname = PRIMARY_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}
