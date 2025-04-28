// OpenRouterService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterService } from "@/lib/openrouter.service";
import type { RequestPayload } from "@/lib/openrouter.types";
import { OpenRouterError } from "@/lib/openrouter.types";

type ResponseFormatSchema = Record<string, unknown>;

// Mock dla Logger
vi.mock("@/lib/logger", () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  })),
}));

// Mock dla fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("OpenRouterService", () => {
  let service: OpenRouterService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OpenRouterService({
      apiKey: "test-api-key",
      timeout: 1000,
      maxRetries: 2,
    });
  });

  describe("setSystemMessage", () => {
    it("should set system message successfully", () => {
      // Arrange
      const message = "Test system message";

      // Act
      service.setSystemMessage(message);

      // Assert
      expect(service["currentSystemMessage"]).toBe(message);
    });

    it("should throw error for empty system message", () => {
      // Arrange
      const emptyMessage = "   ";

      // Act & Assert
      expect(() => service.setSystemMessage(emptyMessage)).toThrow(
        new OpenRouterError("System message cannot be empty", "INVALID_SYSTEM_MESSAGE")
      );
    });

    it("should log error when setting invalid system message", () => {
      // Arrange
      const invalidMessage = "";
      const loggerSpy = vi.spyOn(service["logger"], "error");

      // Act & Assert
      expect(() => service.setSystemMessage(invalidMessage)).toThrow();
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe("setUserMessage", () => {
    it("should set user message successfully", () => {
      // Arrange
      const message = "Test user message";

      // Act
      service.setUserMessage(message);

      // Assert
      expect(service["currentUserMessage"]).toBe(message);
    });

    it("should throw error for empty user message", () => {
      // Arrange
      const emptyMessage = "   ";

      // Act & Assert
      expect(() => service.setUserMessage(emptyMessage)).toThrow(
        new OpenRouterError("User message cannot be empty", "INVALID_USER_MESSAGE")
      );
    });

    it("should log error when setting invalid user message", () => {
      // Arrange
      const invalidMessage = "";
      const loggerSpy = vi.spyOn(service["logger"], "error");

      // Act & Assert
      expect(() => service.setUserMessage(invalidMessage)).toThrow();
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe("setResponseFormat", () => {
    it("should set response format successfully", () => {
      const schema = {
        type: "object" as const,
        properties: {
          test: { type: "string" as const },
        },
      };

      service.setResponseFormat(schema);
      expect(service["currentResponseFormat"]).toEqual(schema);
    });

    it("should throw error for invalid schema format", () => {
      const invalidSchema = "";
      expect(() => service.setResponseFormat(invalidSchema as unknown as ResponseFormatSchema)).toThrow(
        new OpenRouterError("Invalid JSON schema provided", "INVALID_RESPONSE_FORMAT")
      );
    });

    it("should throw error for non-object schema", () => {
      const invalidSchema = "not an object";
      const loggerSpy = vi.spyOn(service["logger"], "error");

      expect(() => service.setResponseFormat(invalidSchema as unknown as ResponseFormatSchema)).toThrow(
        new OpenRouterError("Invalid JSON schema provided", "INVALID_RESPONSE_FORMAT")
      );
      expect(loggerSpy).toHaveBeenCalled();
    });

    describe("setModel", () => {
      it("should set model name successfully", () => {
        // Arrange
        const modelName = "test-model";
        const parameters = { temperature: 0.5 };

        // Act
        service.setModel(modelName, parameters);

        // Assert
        expect(service["currentModelName"]).toBe(modelName);
        expect(service["currentModelParameters"]).toEqual(expect.objectContaining(parameters));
      });

      it("should throw error for empty model name", () => {
        // Arrange
        const emptyModelName = "   ";

        // Act & Assert
        expect(() => service.setModel(emptyModelName)).toThrow(
          new OpenRouterError("Model name cannot be empty", "INVALID_MODEL_NAME")
        );
      });

      it("should merge model parameters with defaults", () => {
        // Arrange
        const modelName = "test-model";
        const parameters = { temperature: 0.8 };

        // Act
        service.setModel(modelName, parameters);

        // Assert
        expect(service["currentModelParameters"]).toEqual({
          temperature: 0.8,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });
      });
    });

    describe("buildRequestPayload", () => {
      beforeEach(() => {
        service.setSystemMessage("System message");
        service.setUserMessage("User message");
        service.setModel("test-model");
      });

      it("should build valid request payload with all fields", () => {
        // Arrange
        const expectedPayload = {
          messages: [
            { role: "system", content: "System message" },
            { role: "user", content: "User message" },
          ],
          model: "test-model",
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        };

        // Act
        const payload = service["buildRequestPayload"]();

        // Assert
        expect(payload).toEqual(expectedPayload);
      });

      it("should include response format when set", () => {
        // Arrange
        const schema = {
          type: "object",
          properties: { test: { type: "string" } },
        };
        service.setResponseFormat(schema);

        // Act
        const payload = service["buildRequestPayload"]();

        // Assert
        expect(payload.response_format).toEqual({
          type: "json_schema",
          json_schema: schema,
        });
      });

      it("should throw error when user message is missing", () => {
        // Arrange
        service = new OpenRouterService({ apiKey: "test" });
        service.setSystemMessage("System message");

        // Act & Assert
        expect(() => service["buildRequestPayload"]()).toThrow(
          new OpenRouterError("User message is required", "MISSING_USER_MESSAGE")
        );
      });
    });

    describe("executeRequest", () => {
      const mockPayload: RequestPayload = {
        messages: [
          { role: "system", content: "System message" },
          { role: "user", content: "User message" },
        ],
        model: "test-model",
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };

      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
        vi.clearAllTimers();
        vi.clearAllMocks();
      });

      it("should successfully execute request", async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: "Test response",
                role: "assistant",
              },
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await service["executeRequest"](mockPayload);

        expect(result).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://openrouter.ai/api/v1/chat/completions",
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              Authorization: "Bearer test-api-key",
            }),
            body: JSON.stringify(mockPayload),
          })
        );
      });
    });
  });
});
