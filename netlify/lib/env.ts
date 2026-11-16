/** Reads a required environment variable or throws a clear configuration error. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new ConfigError(`Missing environment variable: ${name}`);
  }
  return value.trim();
}

export class ConfigError extends Error {}
