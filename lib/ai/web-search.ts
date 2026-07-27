import "server-only";

import { sanitizeMarkdownHref } from "@/lib/safe-url";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";
const SEARCH_TIMEOUT_MS = 10_000;
const MAX_RESULTS = 5;

export type WebSearchResult = {
  title: string;
  url: string;
  content: string;
};

export function isWebSearchConfigured(): boolean {
  return Boolean(process.env.TAVILY_API_KEY);
}

function parseAllowedDomains(): string[] | undefined {
  const raw = process.env.WEB_SEARCH_ALLOWED_DOMAINS;
  if (!raw) {
    return undefined;
  }
  const domains = raw
    .split(",")
    .map((domain) => domain.trim())
    .filter(Boolean);
  return domains.length > 0 ? domains : undefined;
}

type TavilySearchResponse = {
  results?: { title?: string; url?: string; content?: string }[];
};

/**
 * Live web search via Tavily, for recency-sensitive questions the model
 * can't answer from training data alone. Throws on any failure - the
 * caller (chatService's tool loop) decides how to degrade gracefully.
 */
export async function searchWeb(query: string): Promise<WebSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("Web search is not configured (TAVILY_API_KEY is unset)");
  }

  const response = await fetch(TAVILY_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: MAX_RESULTS,
      search_depth: "basic",
      include_domains: parseAllowedDomains(),
    }),
    signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed with status ${response.status}`);
  }

  const data = (await response.json()) as TavilySearchResponse;
  const results: WebSearchResult[] = [];

  for (const result of data.results ?? []) {
    const safeUrl = sanitizeMarkdownHref(result.url);
    // Search results must be absolute http(s) links - sanitizeMarkdownHref
    // also allows "/" and "#" for in-app markdown links, which don't make
    // sense for an external search result.
    if (!safeUrl || !safeUrl.startsWith("http") || !result.title || !result.content) {
      continue;
    }
    results.push({ title: result.title, url: safeUrl, content: result.content });
  }

  return results;
}
