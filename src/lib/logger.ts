export class Logger {
  constructor(private readonly context: string) {}

  private sanitizeMetadata(meta?: Record<string, unknown>): Record<string, unknown> {
    if (!meta) return {};

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(meta)) {
      if (this.isSensitiveKey(key)) {
        sanitized[key] = "[REDACTED]";
        continue;
      }

      if (typeof value === "string" && value.length > 200) {
        sanitized[key] = value.substring(0, 200) + "...";
        continue;
      }

      sanitized[key] = value;
    }
    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const sensitivePatterns = [/api[_-]?key/i, /auth(orization)?/i, /token/i, /secret/i, /password/i, /credential/i];
    return sensitivePatterns.some((pattern) => pattern.test(key));
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    console.info(`[${this.context}] Info:`, message, this.sanitizeMetadata(metadata));
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(`[${this.context}] Warning:`, message, this.sanitizeMetadata(metadata));
  }

  error(error: Error | string, metadata?: Record<string, unknown>): void {
    const sanitizedMeta = this.sanitizeMetadata(metadata);

    if (error instanceof Error) {
      sanitizedMeta.errorName = error.name;
      sanitizedMeta.errorMessage = error.message;
    }

    console.error(`[${this.context}] Error:`, error instanceof Error ? error.message : error, sanitizedMeta);
  }
}
