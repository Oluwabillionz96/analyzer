export function isFullUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isThreeDaysOld(createdAt: string): boolean {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  return new Date(createdAt) < threeDaysAgo;
}

export function cleanUrl(url: string): string {
  try {
    // Decode first to ensure we're working with clean text
    const decoded = decodeURIComponent(url);
    const parsed = new URL(decoded);
    // Strip trailing slash from pathname, lowercase host, remove leading www.
    let host = parsed.host.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    const pathname = parsed.pathname.endsWith("/")
      ? parsed.pathname.slice(0, -1)
      : parsed.pathname;
    return `${parsed.protocol}//${host}${pathname}${parsed.search}`;
  } catch {
    // Fallback: decode and basic trim if URL parsing fails
    try {
      return decodeURIComponent(url)
        .replace(/\/$/, "")
        .replace(/^https?:\/\/www\./, "");
    } catch {
      // If decoding fails, just clean the original
      return url.replace(/\/$/, "").replace(/^https?:\/\/www\./, "");
    }
  }
}
