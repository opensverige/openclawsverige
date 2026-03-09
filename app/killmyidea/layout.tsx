import type { ReactNode } from "react";

import { SiteChrome } from "@/components/landing/site-chrome";

export default function KillMyIdeaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="page">
      <SiteChrome>{children}</SiteChrome>
    </div>
  );
}
