import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function getEffectiveHostname(req: Request): string {
  const forwardedHost = req.headers["x-forwarded-host"];
  const hostHeader = req.headers["host"];
  const rawHost = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost)
    || (typeof hostHeader === "string" ? hostHeader.split(":")[0] : undefined)
    || req.hostname;
  return rawHost.toLowerCase();
}

function isSecureRequest(req: Request): boolean {
  if (req.protocol === "https") return true;
  const proto = req.headers["x-forwarded-proto"];
  if (!proto) return false;
  const list = Array.isArray(proto) ? proto : proto.split(",");
  return list.some(p => p.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = getEffectiveHostname(req);
  const isLocal = LOCAL_HOSTS.has(hostname) || isIpAddress(hostname);
  const parts = hostname.split(".");
  const rootDomain = parts.length >= 2 && !isLocal
    ? `.${parts.slice(-2).join(".")}`
    : undefined;

  return {
    httpOnly: true,
    path: "/",
    sameSite: isLocal ? "lax" as const : "none" as const,
    secure: !isLocal,
    ...(rootDomain && { domain: rootDomain }),
  };
}
