export interface Event {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
  isBase64Encoded?: boolean;
}

export interface Result {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

export function json(statusCode: number, payload: unknown): Result {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(payload) };
}

/** Returns the request body as the exact string that was sent (needed for webhook signatures). */
export function rawBody(event: Event): string {
  if (!event.body) return '';
  return event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
}

export function header(event: Event, name: string): string | undefined {
  const key = Object.keys(event.headers).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? event.headers[key] : undefined;
}
