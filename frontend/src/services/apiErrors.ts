/** Typed API error for consistent UI handling (401, 429, etc.). */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly limitType?: string;
  readonly retryAfterSeconds?: number;
  readonly userMessage: string;

  constructor(options: {
    status: number;
    message: string;
    userMessage: string;
    code?: string;
    limitType?: string;
    retryAfterSeconds?: number;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.userMessage = options.userMessage;
    this.code = options.code;
    this.limitType = options.limitType;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export interface RateLimitErrorBody {
  error?: string;
  message?: string;
  limitType?: string;
  limit?: number;
  window?: string;
  retryAfterSeconds?: number;
}

const RATE_LIMIT_DEFAULTS: Record<string, string> = {
  ai_meal_parse:
    "You've reached your AI meal parsing limit (2 per hour). Try again later or log the meal manually.",
  ai_goal_calculate:
    "You've reached your AI goal calculation limit (2 per day). You can still set goals manually.",
};

function parseRetryAfterSeconds(response: Response): number | undefined {
  const header = response.headers.get('Retry-After');
  if (!header) return undefined;
  const seconds = Number(header);
  if (!Number.isNaN(seconds) && seconds > 0) return seconds;
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, Math.ceil((dateMs - Date.now()) / 1000));
  }
  return undefined;
}

async function parseErrorBody(response: Response): Promise<RateLimitErrorBody | null> {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text) as RateLimitErrorBody;
  } catch {
    return null;
  }
}

function formatRetryHint(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  if (seconds < 60) return ` Try again in about ${seconds} seconds.`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return ` Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`;
  const hours = Math.ceil(minutes / 60);
  return ` Try again in about ${hours} hour${hours === 1 ? '' : 's'}.`;
}

function buildRateLimitUserMessage(body: RateLimitErrorBody | null, retryAfterSeconds?: number): string {
  const limitType = body?.limitType;
  const base =
    body?.message ||
    (limitType && RATE_LIMIT_DEFAULTS[limitType]) ||
    "You've hit a usage limit. Please wait before trying again.";
  return `${base}${formatRetryHint(retryAfterSeconds ?? body?.retryAfterSeconds)}`;
}

/** Throws ApiError when response is not ok. Parses 429 bodies when present. */
export async function throwIfNotOk(response: Response, context: string): Promise<void> {
  if (response.ok) return;

  const retryAfterSeconds = parseRetryAfterSeconds(response);
  const body = await parseErrorBody(response);

  if (response.status === 429) {
    throw new ApiError({
      status: 429,
      message: body?.message || `Rate limited: ${context}`,
      userMessage: buildRateLimitUserMessage(body, retryAfterSeconds),
      code: body?.error || 'rate_limit_exceeded',
      limitType: body?.limitType,
      retryAfterSeconds: retryAfterSeconds ?? body?.retryAfterSeconds,
    });
  }

  if (response.status === 401) {
    throw new ApiError({
      status: 401,
      message: `Unauthorized: ${context}`,
      userMessage: 'Your session expired. Please sign in again.',
      code: 'unauthorized',
    });
  }

  throw new ApiError({
    status: response.status,
    message: body?.message || `${context} failed with status ${response.status}`,
    userMessage: body?.message || `Something went wrong (${response.status}). Please try again.`,
    code: body?.error,
  });
}

export function isRateLimitError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 429;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** User-facing message for catch blocks in chat and forms. */
export function getApiErrorUserMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) return error.userMessage;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
