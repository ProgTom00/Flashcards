export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
}

export class ConsoleLogger implements Logger {
  private sanitizeMetadata(meta?: Record<string, unknown>): Record<string, unknown> {
    if (!meta) return {};

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(meta)) {
      // Skip sensitive data
      if (this.isSensitiveKey(key)) {
        sanitized[key] = "[REDACTED]";
        continue;
      }

      // Truncate long strings
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

  info(message: string, meta?: Record<string, unknown>): void {
    console.info(message, this.sanitizeMetadata(meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(message, this.sanitizeMetadata(meta));
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    const sanitizedMeta = this.sanitizeMetadata(meta);
    if (error) {
      sanitizedMeta.errorName = error.name;
      sanitizedMeta.errorMessage = error.message;
      // Nie logujemy stack trace, może zawierać wrażliwe dane
    }
    console.error(message, sanitizedMeta);
  }
}

export class Logger {
  constructor(private readonly context: string) {}

  error(error: string | Error, metadata?: Record<string, unknown>): void {
    console.error(`[${this.context}] Error:`, error, metadata || "");
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(`[${this.context}] Warning:`, message, metadata || "");
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    console.info(`[${this.context}] Info:`, message, metadata || "");
  }
}
