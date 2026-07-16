const SOURCE_COOKIE = "cq_source";
const SOURCE_FALLBACK = "direct";
const SOURCE_MAX_AGE_SECONDS = 60 * 60; // 1 hour

export function getSourceFromSearchParams(
  searchParams: URLSearchParams | { get(name: string): string | null },
): string {
  const value = searchParams.get("source")?.trim();
  return value && value.length > 0 ? value : SOURCE_FALLBACK;
}

export function setSourceCookie(source: string) {
  if (typeof document === "undefined") return;

  const encoded = encodeURIComponent(source);
  document.cookie = `${SOURCE_COOKIE}=${encoded}; path=/; max-age=${SOURCE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function getSourceCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SOURCE_COOKIE}=`));

  if (!match) return null;

  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export { SOURCE_COOKIE, SOURCE_FALLBACK };
