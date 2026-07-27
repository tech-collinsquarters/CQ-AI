import "server-only";

/** Structured, single-line JSON logging — parseable by any log aggregator without a new dependency. */
export function logEvent(event: string, data: Record<string, unknown> = {}): void {
  console.log(
    JSON.stringify({ level: "info", event, timestamp: new Date().toISOString(), ...data }),
  );
}

export function logError(
  event: string,
  error: unknown,
  data: Record<string, unknown> = {},
): void {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      ...data,
    }),
  );
}
