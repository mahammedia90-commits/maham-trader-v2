import { TRPCError } from "@trpc/server";

// ─── Base Error ───
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    context?: Record<string, unknown>,
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  toTRPCError(): TRPCError {
    const codeMap: Record<number, TRPCError["code"]> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      429: "TOO_MANY_REQUESTS",
      500: "INTERNAL_SERVER_ERROR",
      502: "BAD_GATEWAY",
    };
    return new TRPCError({
      code: codeMap[this.statusCode] || "INTERNAL_SERVER_ERROR",
      message: this.message,
      cause: this,
    });
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.context && process.env.NODE_ENV !== "production"
          ? { details: this.context }
          : {}),
      },
    };
  }
}

// ─── Specific Errors ───
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, "VALIDATION_ERROR", context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource", id?: string | number) {
    super(
      `${resource} not found`,
      404,
      "NOT_FOUND",
      id !== undefined ? { resource, id } : { resource },
    );
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 409, "CONFLICT", context);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", context?: Record<string, unknown>) {
    super(message, 500, "DATABASE_ERROR", context, false);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service unavailable: ${service}`,
      502,
      "EXTERNAL_SERVICE_ERROR",
      { service },
    );
  }
}

// ─── Helper: Wrap non-critical async ops ───
export async function safeAsync<T>(
  fn: () => Promise<T>,
  context: string,
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[SafeAsync] ${context} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}
