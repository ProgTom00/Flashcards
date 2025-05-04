import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenerationService } from "@/services/generation.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { FlashcardSuggestionDTO, Generation } from "@/types";
import { OpenRouterError } from "@/lib/openrouter.types";

// 1. Najpierw zdefiniujmy mock na poziomie modułu
const mockSendChatMessage = vi.fn();

// 2. Poprawmy mockowanie całego OpenRouterService
vi.mock("@/lib/openrouter.service", () => ({
  OpenRouterService: vi.fn().mockImplementation(() => ({
    setSystemMessage: vi.fn(),
    setModel: vi.fn(),
    setResponseFormat: vi.fn(),
    setUserMessage: vi.fn(),
    sendChatMessage: mockSendChatMessage,
  })),
}));

// 3. Zaktualizowany mock dla Logger
vi.mock("@/lib/logger", () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  })),
}));

// Mock factory for Supabase client
const createMockSupabaseClient = () =>
  ({
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }) as unknown as SupabaseClient<Database>;

describe("GenerationService", () => {
  let service: GenerationService;
  let mockSupabase: SupabaseClient<Database>;

  beforeEach(() => {
    vi.clearAllMocks(); // czyścimy stan mocków przed każdym testem
    mockSupabase = createMockSupabaseClient();
    service = new GenerationService(mockSupabase, "test-user-id", { apiKey: "test-key" });
  });

  describe("generateTextHash", () => {
    it("should generate consistent hash for the same input", async () => {
      // Arrange
      const text = "sample text";

      // Act
      const hash1 = await service["generateTextHash"](text);
      const hash2 = await service["generateTextHash"](text);

      // Assert
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hash length in hex
    });

    it("should generate different hashes for different inputs", async () => {
      // Arrange
      const text1 = "sample text 1";
      const text2 = "sample text 2";

      // Act
      const hash1 = await service["generateTextHash"](text1);
      const hash2 = await service["generateTextHash"](text2);

      // Assert
      expect(hash1).not.toBe(hash2);
      expect(hash1).toHaveLength(64);
      expect(hash2).toHaveLength(64);
    });

    it("should handle empty string input", async () => {
      // Arrange & Act
      const hash = await service["generateTextHash"]("");

      // Assert
      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(64); // SHA-256 hash length in hex
    });
  });

  describe("saveGenerationMetadata", () => {
    it("should successfully save generation metadata", async () => {
      // Arrange
      const metadata = {
        sourceText: "test text",
        sourceTextHash: "test-hash",
        generatedCount: 5,
        duration: 1000,
      };

      const mockResponse = {
        data: { id: "gen-123", ...metadata },
        error: null,
      };

      vi.spyOn(mockSupabase, "from").mockImplementation(
        () =>
          ({
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue(mockResponse),
          }) as unknown as SupabaseClient<Database>
      );

      // Act
      const result = await service["saveGenerationMetadata"](metadata);

      // Assert
      expect(result).toEqual(mockResponse.data);
      expect(mockSupabase.from).toHaveBeenCalledWith("generations");
    });

    it("should throw error when database operation fails", async () => {
      // Arrange
      const metadata = {
        sourceText: "test text",
        sourceTextHash: "test-hash",
        generatedCount: 5,
        duration: 1000,
      };

      vi.spyOn(mockSupabase, "from").mockImplementation(
        () =>
          ({
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: new Error("DB Error") }),
          }) as unknown as SupabaseClient<Database>
      );

      // Act & Assert
      await expect(service["saveGenerationMetadata"](metadata)).rejects.toThrow("Failed to create generation record");
    });
  });

  describe("callAiService", () => {
    it("should successfully generate flashcards from text", async () => {
      // Arrange
      const mockAiResponse = {
        flashcards: [
          { front: "Question 1", back: "Answer 1" },
          { front: "Question 2", back: "Answer 2" },
        ],
      };

      mockSendChatMessage.mockResolvedValueOnce(JSON.stringify(mockAiResponse));

      // Act
      const result = await service["callAiService"]("test");

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        front: "Question 1",
        back: "Answer 1",
        source: "ai-full",
      });
    });

    it("should handle AI service errors", async () => {
      // Arrange
      const aiError = new OpenRouterError("AI Service Error", "SERVICE_ERROR");
      mockSendChatMessage.mockRejectedValueOnce(aiError);

      // Act & Assert
      await expect(service["callAiService"]("test")).rejects.toThrow(aiError);
    });

    it("should handle invalid JSON response", async () => {
      // Arrange
      mockSendChatMessage.mockResolvedValueOnce("invalid json");

      // Act & Assert
      await expect(service["callAiService"]("test")).rejects.toThrow("Invalid JSON in API response");
    });

    it("should validate response format against schema", async () => {
      // Arrange
      const invalidResponse = {
        flashcards: [
          { front: "Question 1" }, // missing 'back' field
        ],
      };

      mockSendChatMessage.mockResolvedValueOnce(JSON.stringify(invalidResponse));

      // Act & Assert
      await expect(service["callAiService"]("test")).rejects.toThrow();
    });
  });

  describe("generateFlashcards", () => {
    it("should successfully generate and save flashcards", async () => {
      // Arrange
      const inputText = "test content";
      const mockAiFlashcards = [
        { front: "Q1", back: "A1", source: "ai-full" as const },
        { front: "Q2", back: "A2", source: "ai-full" as const },
      ];

      const mockGenerationMetadata: Generation = {
        id: "gen-123",
        duration: 1000,
        generated_count: 2,
        accepted_edited_count: null,
        accepted_unedited_count: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        model: "openai/gpt-4o-mini", // Updated model name
        source_text_hash: "test-hash",
        source_text_length: 100,
        user_id: "test-user-id",
      };

      vi.spyOn(
        service as unknown as { callAiService: (text: string) => Promise<FlashcardSuggestionDTO[]> },
        "callAiService"
      ).mockResolvedValue(mockAiFlashcards);

      vi.spyOn(
        service as unknown as {
          saveGenerationMetadata: (data: {
            sourceText: string;
            sourceTextHash: string;
            generatedCount: number;
            duration: number;
          }) => Promise<Generation>;
        },
        "saveGenerationMetadata"
      ).mockResolvedValue(mockGenerationMetadata);

      // Act
      const result = await service.generateFlashcards(inputText);

      // Assert
      expect(result).toEqual({
        generation_id: "gen-123",
        data: mockAiFlashcards,
        generated_count: 2,
      });
    });

    it("should handle AI service failure and log error", async () => {
      // Arrange
      const aiError = new OpenRouterError("AI Service Failed", "SERVICE_ERROR");
      vi.spyOn(
        service as unknown as { callAiService: (text: string) => Promise<FlashcardSuggestionDTO[]> },
        "callAiService"
      ).mockRejectedValue(aiError);

      const logErrorSpy = vi.spyOn(service["logger"], "error");
      const logGenerationErrorSpy = vi.spyOn(
        service as unknown as { logGenerationError: (error: Error, text: string) => Promise<void> },
        "logGenerationError"
      );

      // Act & Assert
      await expect(service.generateFlashcards("test")).rejects.toThrow(aiError);
      expect(logErrorSpy).toHaveBeenCalled();
      expect(logGenerationErrorSpy).toHaveBeenCalledWith(aiError, "test");
    });

    it("should handle metadata saving failure", async () => {
      // Arrange
      const mockAiFlashcards = [{ front: "Q1", back: "A1", source: "ai-full" as const }];
      const dbError = new Error("Database Error");

      vi.spyOn(
        service as unknown as { callAiService: (text: string) => Promise<FlashcardSuggestionDTO[]> },
        "callAiService"
      ).mockResolvedValue(mockAiFlashcards);

      vi.spyOn(
        service as unknown as {
          saveGenerationMetadata: (data: {
            sourceText: string;
            sourceTextHash: string;
            generatedCount: number;
            duration: number;
          }) => Promise<Generation>;
        },
        "saveGenerationMetadata"
      ).mockRejectedValue(dbError);

      const logErrorSpy = vi.spyOn(service["logger"], "error");
      const logGenerationErrorSpy = vi.spyOn(
        service as unknown as { logGenerationError: (error: Error, text: string) => Promise<void> },
        "logGenerationError"
      );

      // Act & Assert
      await expect(service.generateFlashcards("test")).rejects.toThrow(dbError);
      expect(logErrorSpy).toHaveBeenCalled();
      expect(logGenerationErrorSpy).toHaveBeenCalledWith(dbError, "test");
    });
  });
});
