import { z } from "zod";

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export interface ModelParameters {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface RequestPayload {
  messages: {
    role: "system" | "user";
    content: string;
  }[];
  model: string;
  response_format?: {
    type: "json_schema";
    json_schema: Record<string, unknown>;
  };
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ApiResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

export interface ServiceConfig {
  apiKey: string;
  apiUrl?: string;
  timeout?: number;
  maxRetries?: number;
  defaultModel?: string;
}

// Zod Schemas
export const modelParametersSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
});

export const messageSchema = z.object({
  role: z.enum(["system", "user"]),
  content: z.string().min(1),
});

export const requestPayloadSchema = z.object({
  messages: z.array(messageSchema).min(1),
  model: z.string().min(1),
  response_format: z
    .object({
      type: z.literal("json_schema"),
      json_schema: z.record(z.unknown()),
    })
    .optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
});

export const apiResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        role: z.string(),
        content: z.string(),
      }),
    })
  ),
});
