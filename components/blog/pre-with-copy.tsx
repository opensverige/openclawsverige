"use client";

import { Children, isValidElement, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const COPIED_DURATION_MS = 2000;

function getLangFromChildren(children: React.ReactNode): string {
  const code = Children.toArray(children).find(
    (c) => isValidElement(c) && (c.type as unknown as string) === "code"
  );
  const props = isValidElement(code) ? (code.props as { className?: string }) : null;
  if (!props?.className) return "code";
  const match = String(props.className).match(/language-(\w+)/);
  return match ? match[1] : "code";
}

export function PreWithCopyBar({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const lang = getLangFromChildren(children);

  const handleCopy = () => {
    const code = wrapperRef.current?.querySelector("code");
    const text = code?.innerText ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_DURATION_MS);
    });
  };

  return (
    <div
      ref={wrapperRef}
      className="code-block-wrapper my-6 overflow-hidden rounded-xl border border-border/60 bg-[hsl(0_0%_8%)]"
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3 py-2 text-xs">
        <span className="font-medium uppercase tracking-wider text-muted-foreground">
          {lang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--crayfish-red)]/50"
          aria-label="Kopiera kod"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden />
              Kopierat!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Kopiera
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto py-4">
        <pre
          className={cn("my-0 overflow-x-auto px-4", className)}
          style={{ whiteSpace: "pre" }}
          {...props}
        >
          {children}
        </pre>
      </div>
    </div>
  );
}
