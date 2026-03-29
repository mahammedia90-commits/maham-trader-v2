function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`[ENV] FATAL: Missing required environment variable: ${key}`);
    if (process.env.NODE_ENV === "production") process.exit(1);
    return "";
  }
  return value;
}

function optionalEnv(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const ENV = {
  appId: requireEnv("VITE_APP_ID"),
  cookieSecret: requireEnv("JWT_SECRET"),
  databaseUrl: requireEnv("DATABASE_URL"),
  oAuthServerUrl: optionalEnv("OAUTH_SERVER_URL"),
  ownerOpenId: optionalEnv("OWNER_OPEN_ID"),
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: optionalEnv("BUILT_IN_FORGE_API_URL"),
  forgeApiKey: optionalEnv("BUILT_IN_FORGE_API_KEY"),
};
