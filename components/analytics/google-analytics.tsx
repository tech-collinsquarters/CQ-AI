import { GoogleAnalytics } from "@next/third-parties/google";

/**
 * GA4 measurement IDs look like `G-XXXXXXXXXX`. Validate before loading so a
 * malformed env var never injects an unexpected script tag.
 */
const rawGaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_MEASUREMENT_ID =
  rawGaId && /^G-[A-Z0-9]+$/i.test(rawGaId) ? rawGaId : undefined;

/** Loads GA4 for all routes when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. */
export function AppGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
