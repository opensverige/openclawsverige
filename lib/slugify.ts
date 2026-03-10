import type React from "react";

/** Safe for URL path segments (prevents injection in href). Only allows alphanumeric, Swedish letters, hyphen, underscore. */
export function sanitizePathSegment(slug: string): string {
  return String(slug).replace(/[^a-zA-Z0-9\u00E5\u00E4\u00F6\u00C5\u00C4\u00D6_-]/g, "");
}

/** Strip characters that could be used in XSS when rendering stored content as text (CodeQL stored-xss). React escapes anyway; this is defense in depth. */
export function sanitizeForDisplay(text: string): string {
  return String(text)
    .replace(/[\0<>]/g, "")
    .replace(/\u2028|\u2029/g, "");
}

export function slugify(text: string): string {
  return String(text)
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\u00E5\u00E4\u00F6\u00C5\u00C4\u00D6-]/g, "")
    .toLowerCase();
}

export function getHeadingId(children: React.ReactNode): string {
  // Server: children can be string or array of strings from MDX
  const text = typeof children === "string" ? children : flattenChildren(children);
  return slugify(text);
}

function flattenChildren(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenChildren).join("");
  if (node && typeof node === "object" && "props" in node) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return flattenChildren(el.props.children);
  }
  return "";
}
