/** Browser calls to the `/api/demo/*` routes. */

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string };

const NETWORK_ERROR = "We couldn't reach BalloAds. Check your connection and try again.";

export async function demoApi<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; signal?: AbortSignal } = {},
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`/api/demo/${path}`, {
      method: init.method ?? "GET",
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      signal: init.signal,
    });
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
  const json: unknown = await res.json().catch(() => null);
  const obj = json && typeof json === "object" ? (json as Record<string, unknown>) : null;
  if (!res.ok) {
    const error = typeof obj?.error === "string" ? obj.error : "Something went wrong. Please try again.";
    return { ok: false, status: res.status, error };
  }
  return { ok: true, status: res.status, data: obj?.data as T };
}

/** `?from=` value or the same-site referrer path, as a "/path" string. */
export function detectSourcePage(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const from = new URLSearchParams(window.location.search).get("from");
  const clean = (value: string) =>
    `/${value.replace(/[^A-Za-z0-9/_-]/g, "").replace(/^\/+/, "")}`.slice(0, 200);
  if (from) return clean(from);
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.origin === window.location.origin && !ref.pathname.startsWith("/book-demo")) {
        return clean(ref.pathname);
      }
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export function detectUtm(): Record<string, string> | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ["source", "medium", "campaign", "term", "content"]) {
    const value = params.get(`utm_${key}`)?.trim();
    if (value) utm[key] = value.slice(0, 200);
  }
  return Object.keys(utm).length > 0 ? utm : undefined;
}
