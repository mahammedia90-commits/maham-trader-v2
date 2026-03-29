type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Sensitive fields that must never be logged
const REDACT_KEYS = new Set([
  "password", "passwordHash", "secret", "token", "jwt",
  "apiKey", "api_key", "authorization", "cookie", "otp", "code",
  "creditCard", "cardNumber", "cvv", "ssn",
]);

function redact(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (REDACT_KEYS.has(key.toLowerCase())) {
      clean[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      clean[key] = redact(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function formatEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    entry.context ? `[${entry.context}]` : "",
    entry.message,
  ].filter(Boolean);

  let line = parts.join(" ");

  if (entry.data) {
    line += " " + JSON.stringify(redact(entry.data));
  }

  if (entry.error) {
    line += ` | Error: ${entry.error.name}: ${entry.error.message}`;
    if (!IS_PRODUCTION && entry.error.stack) {
      line += `\n${entry.error.stack}`;
    }
  }

  return line;
}

function createEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: Record<string, unknown>,
  error?: Error,
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    data,
    error: error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : undefined,
  };
}

export const logger = {
  error(message: string, context?: string, data?: Record<string, unknown>, error?: Error) {
    console.error(formatEntry(createEntry("error", message, context, data, error)));
  },

  warn(message: string, context?: string, data?: Record<string, unknown>) {
    console.warn(formatEntry(createEntry("warn", message, context, data)));
  },

  info(message: string, context?: string, data?: Record<string, unknown>) {
    console.log(formatEntry(createEntry("info", message, context, data)));
  },

  debug(message: string, context?: string, data?: Record<string, unknown>) {
    if (!IS_PRODUCTION) {
      console.log(formatEntry(createEntry("debug", message, context, data)));
    }
  },
};
