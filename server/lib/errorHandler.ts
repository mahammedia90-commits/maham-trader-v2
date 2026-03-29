import type { Request, Response, NextFunction } from "express";
import { AppError } from "./errors";
import { logger } from "./logger";

/**
 * Global Express error handler — catches any unhandled errors.
 * Place AFTER all routes: app.use(globalErrorHandler);
 */
export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    // Operational error — expected, safe to expose message
    if (err.statusCode >= 500) {
      logger.error(err.message, "ErrorHandler", err.context, err);
    } else {
      logger.warn(err.message, "ErrorHandler", err.context);
    }
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // CORS errors
  if (err.message?.includes("CORS")) {
    logger.warn("CORS rejection", "ErrorHandler", { origin: _req.headers.origin });
    res.status(403).json({
      success: false,
      error: { code: "CORS_ERROR", message: "Origin not allowed" },
    });
    return;
  }

  // Unknown / programming error — don't expose details
  logger.error("Unhandled error", "ErrorHandler", undefined, err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
    },
  });
}

/**
 * tRPC error formatter — use in trpc.ts
 * Formats AppError instances into consistent tRPC error shape.
 */
export function formatTRPCError(shape: any, error: any) {
  const cause = error?.cause;
  if (cause instanceof AppError) {
    return {
      ...shape,
      data: {
        ...shape.data,
        appError: cause.toJSON().error,
      },
    };
  }
  return shape;
}
