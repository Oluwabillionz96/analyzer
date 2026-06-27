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
  return encodeURIComponent(url.endsWith("/") ? url.slice(0, -1) : url).replace(
    "www.",
    "",
  );
}
