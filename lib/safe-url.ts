const ALLOWED_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/** Returns a safe href for rendered markdown links, or null to omit the anchor. */
export function sanitizeMarkdownHref(href: string | undefined): string | null {
  if (!href) {
    return null;
  }

  const trimmed = href.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return ALLOWED_LINK_PROTOCOLS.has(url.protocol) ? trimmed : null;
  } catch {
    return null;
  }
}
