/**
 * Every outbound link to the firm's public website should go through
 * `buildFirmLink` so collinsquarters.com's analytics can attribute traffic
 * back to where in the AI portal it came from (sidebar, contact dialog,
 * chat assistant cross-sell, quota upsell, plan comparison, etc).
 */
export const FIRM_WEBSITE_BASE_URL = "https://collinsquarters.com";

const UTM_SOURCE = "cq_ai_portal";
const UTM_MEDIUM = "referral";
const UTM_CAMPAIGN = "client_portal";

/** `content` identifies the specific link/placement (GA4 utm_content convention). */
export function buildFirmLink(
  content: string,
  baseUrl: string = FIRM_WEBSITE_BASE_URL,
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", UTM_SOURCE);
  url.searchParams.set("utm_medium", UTM_MEDIUM);
  url.searchParams.set("utm_campaign", UTM_CAMPAIGN);
  url.searchParams.set("utm_content", content);
  return url.toString();
}
