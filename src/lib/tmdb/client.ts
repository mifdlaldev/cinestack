export class TmdbApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number | undefined;

  constructor(message: string, code: string = "UNKNOWN", statusCode?: number) {
    super(message);
    this.name = "TmdbApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

const TMDB_BASE =
  process.env.TMDB_API_BASE_URL ?? "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const DEFAULT_REVALIDATE = 3_600;

export interface FetchOptions {
  revalidate?: number;
  params?: Record<string, string>;
}

async function fetchFromTmdb<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { revalidate = DEFAULT_REVALIDATE, params } = options;
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  const key = process.env.TMDB_API_KEY;

  const url = new URL(`${TMDB_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  if (!token && key) {
    url.searchParams.set("api_key", key);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const headers: Record<string, string> = { accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const apiCode = errorBody.status_code?.toString() ?? "UNKNOWN";
      throw new TmdbApiError(
        errorBody.status_message ?? `TMDB API error: ${response.status}`,
        apiCode,
        response.status,
      );
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

export { TMDB_IMAGE_BASE, DEFAULT_REVALIDATE, fetchFromTmdb };
