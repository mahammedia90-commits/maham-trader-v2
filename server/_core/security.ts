import type { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const ALLOWED_ORIGINS = [
  /^https:\/\/([a-z]+\.)?mahamexpo\.sa$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function registerSecurityMiddleware(app: Express): void {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "https:", "data:"],
          connectSrc: ["'self'", "https://*.mahamexpo.sa"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.some((pattern) => pattern.test(origin))) {
          return callback(null, true);
        }
        callback(new Error("CORS: Origin not allowed"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400,
    })
  );

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: getClientIp,
      skip: (req) => req.path === "/api/health" || req.path === "/",
      message: { error: "Too many requests, please try again later" },
    })
  );

  app.use(
    "/api/oauth",
    rateLimit({
      windowMs: 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: getClientIp,
      message: { error: "Too many auth attempts, please wait" },
    })
  );

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(self), usb=()"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });

  console.log("[Security] Helmet, CORS, rate limiters registered");
}
