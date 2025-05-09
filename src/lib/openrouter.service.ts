import { z } from "zod";
import type { ModelParameters, RequestPayload, ApiResponse } from "./openrouter.types";
import { OpenRouterError, requestPayloadSchema, apiResponseSchema } from "./openrouter.types";
import { Logger } from "./logger";

// Validation schemas
const configSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  apiUrl: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  maxRetries: z.number().positive().optional(),
});

export class OpenRouterService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly defaultTimeout: number;
  private readonly maxRetries: number;
  private readonly logger: Logger;

  private currentSystemMessage = "";
  private currentUserMessage = "";
  private currentResponseFormat?: Record<string, unknown>;
  private currentModelName = "openai/gpt-4o-mini";
  private currentModelParameters: ModelParameters = {
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  constructor(config: { apiKey: string; apiUrl?: string; timeout?: number; maxRetries?: number }) {
    this.logger = new Logger("OpenRouterService");

    try {
      // Validate configuration using Zod
      const validatedConfig = configSchema.parse(config);

      this.apiKey = validatedConfig.apiKey;
      this.apiUrl = validatedConfig.apiUrl || "https://openrouter.ai/api/v1";
      this.defaultTimeout = validatedConfig.timeout || 30000;
      this.maxRetries = validatedConfig.maxRetries || 3;
    } catch (error) {
      this.logger.error(error as Error, {
        config: {
          ...config,
          apiKey: "[REDACTED]",
        },
      });
      throw error;
    }
  }

  /**
   * Sets the system message that provides context for the model
   */
  public setSystemMessage(message: string): void {
    try {
      if (!message.trim()) {
        throw new OpenRouterError("System message cannot be empty", "INVALID_SYSTEM_MESSAGE");
      }
      this.currentSystemMessage = message;
    } catch (error) {
      this.logger.error(error as Error, { messageLength: message.length });
      throw error;
    }
  }

  /**
   * Sets the user message to be processed by the model
   */
  public setUserMessage(message: string): void {
    try {
      if (!message.trim()) {
        throw new OpenRouterError("User message cannot be empty", "INVALID_USER_MESSAGE");
      }
      this.currentUserMessage = message;
    } catch (error) {
      this.logger.error(error as Error, { messageLength: message.length });
      throw error;
    }
  }

  /**
   * Sets the JSON schema for structured responses
   */
  public setResponseFormat(schema: Record<string, unknown>): void {
    try {
      if (typeof schema !== "object" || schema === null) {
        throw new OpenRouterError("Schema must be an object", "INVALID_RESPONSE_FORMAT");
      }

      this.currentResponseFormat = schema;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error("Failed to set response format", error);
      } else {
        this.logger.error("Failed to set response format", new Error(String(error)));
      }
      throw new OpenRouterError("Invalid JSON schema provided", "INVALID_RESPONSE_FORMAT");
    }
  }

  private isValidPropertiesObject(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === "object" && obj !== null;
  }

  /**
   * Sets the model and its parameters
   */
  public setModel(name: string, parameters?: ModelParameters): void {
    try {
      if (!name.trim()) {
        throw new OpenRouterError("Model name cannot be empty", "INVALID_MODEL_NAME");
      }

      this.currentModelName = name;
      if (parameters) {
        this.currentModelParameters = {
          ...this.currentModelParameters,
          ...parameters,
        };
      }
    } catch (error) {
      this.logger.error(error as Error, {
        modelName: name,
        parameters,
      });
      throw error;
    }
  }

  /**
   * Sends a chat message to the OpenRouter API and returns the response
   * @throws {OpenRouterError} If the request fails or validation fails
   */
  public async sendChatMessage(): Promise<string> {
    try {
      const payload = this.buildRequestPayload();

      try {
        requestPayloadSchema.parse(payload);
      } catch (validationError) {
        const error = validationError as Error;
        this.logger.error(error, {
          validationDetails: validationError instanceof z.ZodError ? validationError.errors : undefined,
          payload: {
            ...payload,
            messages: payload.messages.map((m) => ({
              role: m.role,
              contentLength: m.content.length,
            })),
          },
        });
        throw validationError;
      }

      const response = await this.executeRequest(payload);

      try {
        apiResponseSchema.parse(response);
      } catch (validationError) {
        const error = validationError as Error;
        this.logger.error(error, {
          validationDetails: validationError instanceof z.ZodError ? validationError.errors : undefined,
          response: {
            choicesCount: response.choices?.length,
            firstChoice: response.choices?.[0]
              ? {
                  hasMessage: Boolean(response.choices[0].message),
                  messageKeys: response.choices[0].message ? Object.keys(response.choices[0].message) : [],
                }
              : null,
          },
        });
        throw validationError;
      }

      if (!response.choices.length) {
        throw new OpenRouterError("No response received from the model", "EMPTY_RESPONSE");
      }

      return response.choices[0].message.content;
    } catch (error) {
      // Log the error with relevant metadata
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.logger.error(errorObj, {
        errorDetails:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                code: error instanceof OpenRouterError ? error.code : undefined,
                validationErrors: error instanceof z.ZodError ? error.errors : undefined,
              }
            : undefined,
        context: {
          modelName: this.currentModelName,
          hasSystemMessage: Boolean(this.currentSystemMessage),
          userMessageLength: this.currentUserMessage.length,
          hasResponseFormat: Boolean(this.currentResponseFormat),
        },
      });

      if (error instanceof z.ZodError) {
        throw new OpenRouterError(`Validation error: ${error.errors[0].message}`, "VALIDATION_ERROR");
      }

      if (error instanceof OpenRouterError) {
        throw error;
      }

      throw new OpenRouterError(errorMessage, "UNEXPECTED_ERROR");
    }
  }

  /**
   * Builds the request payload for the OpenRouter API
   */
  private buildRequestPayload(): RequestPayload {
    try {
      const messages = [];

      if (this.currentSystemMessage) {
        messages.push({
          role: "system" as const,
          content: this.currentSystemMessage,
        });
      }

      if (!this.currentUserMessage) {
        throw new OpenRouterError("User message is required", "MISSING_USER_MESSAGE");
      }

      messages.push({
        role: "user" as const,
        content: this.currentUserMessage,
      });

      const payload: RequestPayload = {
        messages,
        model: this.currentModelName,
        ...this.currentModelParameters,
      };

      if (this.currentResponseFormat) {
        payload.response_format = {
          type: "json_schema",
          json_schema: this.currentResponseFormat,
        };
      }

      return payload;
    } catch (error) {
      this.logger.error(error as Error, {
        hasSystemMessage: Boolean(this.currentSystemMessage),
        hasUserMessage: Boolean(this.currentUserMessage),
        modelName: this.currentModelName,
      });
      throw error;
    }
  }

  /**
   * Executes a request to the OpenRouter API with retry logic
   */
  private async executeRequest(requestPayload: RequestPayload): Promise<ApiResponse> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(`${this.apiUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "X-Title": "Flashcards App",
          },
          body: JSON.stringify(requestPayload),
          signal: AbortSignal.timeout(this.defaultTimeout),
        });

        const data = await response.json();

        // Log the raw response for debugging
        this.logger.info("OpenRouter API Raw Response:", { response: data });

        // Check if the response contains an error
        if (!response.ok || data.error) {
          const errorMessage = data.error?.message || `HTTP error ${response.status}`;
          const errorCode = data.error?.code || response.status;
          throw new OpenRouterError(errorMessage, "API_ERROR", errorCode);
        }

        // Validate that we have the minimum required fields
        if (!data.choices || !Array.isArray(data.choices)) {
          throw new OpenRouterError("Invalid response format: missing choices array", "INVALID_RESPONSE");
        }

        return data as ApiResponse;
      } catch (error) {
        lastError = error as Error;

        // Log retry attempts
        this.logger.warn(`Request failed, attempt ${attempt + 1} of ${this.maxRetries}`, {
          attempt: attempt + 1,
          maxRetries: this.maxRetries,
          errorCode: error instanceof OpenRouterError ? error.code : undefined,
          status: error instanceof OpenRouterError ? error.status : undefined,
        });

        // Don't retry on authentication errors or invalid requests
        if (error instanceof OpenRouterError && (error.status === 401 || error.status === 400)) {
          this.logger.error(error, {
            status: error.status,
            code: error.code,
          });
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise((resolve) => setTimeout(resolve, delay));

        attempt++;
      }
    }

    const maxRetriesError = lastError || new OpenRouterError("Maximum retry attempts exceeded", "MAX_RETRIES_EXCEEDED");

    this.logger.error(maxRetriesError, {
      attempts: attempt,
      maxRetries: this.maxRetries,
    });

    throw maxRetriesError;
  }
}
