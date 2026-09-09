/**
 * Server-side client for the Brutus `site-assistant` task — the RAG chatbot in
 * the site's chat widget.
 *
 * Nothing here may run in the browser: `BRUTUS_API_KEY` is a shared internal
 * key for the whole AI hub. The widget talks to /api/brutus-chat, which is the
 * only thing that talks to Brutus.
 */

export const BRUTUS_CHAT_TASK = "site-assistant";

/** Matches SITE_MAX_MESSAGE_CHARS in brutus (the task rejects longer). */
export const MAX_MESSAGE_CHARS = 500;
/** Turns kept per request. Brutus caps this too; this keeps the payload small. */
export const MAX_HISTORY_TURNS = 6;

export type BrutusChatTurn = { role: "user" | "assistant"; content: string };

export type BrutusChatSource = { type: string; title: string; url?: string };

export type BrutusChatAnswer = {
  reply: string;
  grounded: boolean;
  confidence: number;
  sources: BrutusChatSource[];
  followUps: string[];
  escalate: boolean;
};

export type BrutusChatRequest = { message: string; history: BrutusChatTurn[] };

export function getBrutusConfig() {
  const baseUrl = (process.env.BRUTUS_BASE_URL ?? "").trim().replace(/\/+$/, "");
  const apiKey = (process.env.BRUTUS_API_KEY ?? "").trim();
  const productId =
    (process.env.BRUTUS_SITE_PRODUCT_ID ?? "ballo-landing").trim() || "ballo-landing";
  const contextId = (process.env.BRUTUS_CONTEXT_ID ?? "ballo-default").trim() || "ballo-default";
  return { baseUrl, apiKey, productId, contextId };
}

export function validateBrutusChatRequest(
  body: unknown,
): { ok: true; value: BrutusChatRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body is required" };
  }
  const record = body as Record<string, unknown>;

  const message = typeof record.message === "string" ? record.message.trim() : "";
  if (!message) return { ok: false, error: "message is required" };
  if (message.length > MAX_MESSAGE_CHARS) {
    return { ok: false, error: `message must be ${MAX_MESSAGE_CHARS} characters or fewer` };
  }

  // History is client-supplied and therefore untrusted: keep only well-formed
  // turns, normalize the role to the two the task accepts, and clamp both the
  // number of turns and each turn's length so a crafted payload can't inflate
  // the prompt.
  const history: BrutusChatTurn[] = Array.isArray(record.history)
    ? record.history
        .filter(
          (turn): turn is Record<string, unknown> =>
            !!turn && typeof turn === "object" && typeof (turn as { content?: unknown }).content === "string",
        )
        .map((turn) => ({
          role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: String(turn.content).trim().slice(0, MAX_MESSAGE_CHARS),
        }))
        .filter((turn) => turn.content !== "")
        .slice(-MAX_HISTORY_TURNS)
    : [];

  return { ok: true, value: { message, history } };
}

type BrutusProcessResponse = {
  success?: boolean;
  data?: unknown;
  error?: string;
  message?: string;
};

export type BrutusChatResult =
  | { ok: true; answer: BrutusChatAnswer }
  | { ok: false; status: number; error: string };

/**
 * Coerce the task response into the widget's shape.
 *
 * Defensive rather than trusting: if a field is missing or the wrong type, the
 * safe reading is "not grounded" — the widget then shows the hand-off, which is
 * always a correct thing to say.
 */
export function normalizeBrutusChatAnswer(data: unknown): BrutusChatAnswer | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  const reply = typeof record.reply === "string" ? record.reply.trim() : "";
  if (!reply) return null;

  const sources: BrutusChatSource[] = Array.isArray(record.sources)
    ? record.sources
        .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
        .map((s) => ({
          type: typeof s.type === "string" ? s.type : "page",
          title: typeof s.title === "string" ? s.title : "",
          ...(typeof s.url === "string" && s.url.startsWith("/") ? { url: s.url } : {}),
        }))
        .filter((s) => s.title !== "")
    : [];

  return {
    reply,
    grounded: record.grounded === true,
    confidence: typeof record.confidence === "number" ? record.confidence : 0,
    sources,
    followUps: Array.isArray(record.followUps)
      ? record.followUps.filter((f): f is string => typeof f === "string" && f.trim() !== "")
      : [],
    escalate: record.escalate === true,
  };
}

const TIMEOUT_MS = 25000;
/** Pause before the single retry of an immediately-failed request. */
const RETRY_DELAY_MS = 250;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** True for errors that mean the request never got off the ground. */
function isConnectivityError(err: unknown): boolean {
  const cause = (err as { cause?: { code?: string } })?.cause;
  const code = cause?.code ?? (err as { code?: string })?.code;
  return (
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "EPIPE"
  );
}

export async function callBrutusChat(request: BrutusChatRequest): Promise<BrutusChatResult> {
  const { baseUrl, apiKey, productId, contextId } = getBrutusConfig();
  if (!baseUrl) {
    // Local dev hits this whenever BRUTUS_BASE_URL is unset, and the flag
    // defaults on in `next dev` — so say what to do about it, server side.
    console.error(
      "[brutusChat] BRUTUS_BASE_URL is not set. Set it (and BRUTUS_API_KEY) in .env.local, " +
        "or set NEXT_PUBLIC_FEATURE_SITE_ASSISTANT=false to hide the widget locally.",
    );
    return {
      ok: false,
      status: 503,
      error: "Brutus is not switched on yet. Our team can help you in the meantime.",
    };
  }

  const send = () =>
    fetch(`${baseUrl}/brutus/v1/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        productId,
        taskType: BRUTUS_CHAT_TASK,
        contextId,
        payload: { message: request.message, history: request.history },
      }),
      cache: "no-store",
      // A fresh signal per attempt: an AbortSignal is single-use.
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

  let response: Response;
  try {
    try {
      response = await send();
    } catch (err) {
      // One dropped DNS query should not surface as a broken widget. These fail
      // in milliseconds, so the retry costs nothing the visitor can feel, and
      // it is deliberately not applied to a timeout, where a second attempt
      // would double an already long wait.
      if (!isConnectivityError(err)) throw err;
      console.warn("[brutusChat] connection failed, retrying once");
      await delay(RETRY_DELAY_MS);
      response = await send();
    }
  } catch (err) {
    // A timeout and "the host does not resolve" are different problems and the
    // visitor deserves the right sentence for each. Reporting a 27ms DNS
    // failure as "that took too long" sends whoever is debugging it looking for
    // a slow upstream that is not there.
    const cause = (err as { cause?: { code?: string } })?.cause;
    const code = cause?.code ?? (err as { code?: string })?.code;
    const isTimeout =
      err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");

    console.error("[brutusChat] request failed", {
      url: `${baseUrl}/brutus/v1/tasks`,
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message : String(err),
      code,
    });

    if (isTimeout) {
      return { ok: false, status: 504, error: "That took too long to come back. Please try again." };
    }

    // DNS, refused connections, and TLS failures mean the host is wrong or
    // unreachable from this server: a configuration problem, not a busy one.
    if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
      console.error(
        `[brutusChat] cannot resolve ${baseUrl}. Check BRUTUS_BASE_URL, and on macOS try ` +
          "`sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder`.",
      );
    }

    return {
      ok: false,
      status: 503,
      error: "I can't reach Brutus right now. Please try again in a moment.",
    };
  }

  const text = await response.text();
  let json: BrutusProcessResponse | null = null;
  try {
    json = text ? (JSON.parse(text) as BrutusProcessResponse) : null;
  } catch {
    json = null;
  }

  if (!response.ok) {
    // Upstream detail (keys, task names, stack traces) never reaches the browser.
    console.error("[brutusChat] non-OK response", {
      status: response.status,
      body: text.slice(0, 300),
    });
    // 404 means the feature flag is off upstream — that is "unavailable", not "broken".
    const status = response.status === 404 ? 503 : 502;
    return {
      ok: false,
      status,
      error: "Brutus is offline right now. Please try again in a moment.",
    };
  }

  const answer = normalizeBrutusChatAnswer(json?.data);
  if (!answer) {
    console.error("[brutusChat] unusable response shape", text.slice(0, 300));
    return {
      ok: false,
      status: 502,
      error: "Brutus is offline right now. Please try again in a moment.",
    };
  }

  return { ok: true, answer };
}
