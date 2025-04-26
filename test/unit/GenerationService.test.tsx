import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenerationService } from "@/services/generation.service";
import { OpenRouterService } from "@/lib/openrouter.service";
import { Logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

// 1. Najpierw zdefiniujmy mock na poziomie modułu
const mockSendChatMessage = vi.fn();

// 2. Poprawmy mockowanie całego OpenRouterService
vi.mock("@/lib/openrouter.service", () => ({
  OpenRouterService: vi.fn().mockImplementation(() => ({
    setSystemMessage: vi.fn(),
    setModel: vi.fn(),
    setResponseFormat: vi.fn(),
    setUserMessage: vi.fn(),
    sendChatMessage: mockSendChatMessage, // używamy zdefiniowanego mocka
  })),
}));

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
    it("should generate consistent hash for the same input", () => {
      // Arrange
      const text = "sample text";

      // Act
      const hash1 = service["generateTextHash"](text);
      const hash2 = service["generateTextHash"](text);

      // Assert
      expect(hash1).toBe(hash2);
      expect(hash1).toMatchInlineSnapshot(`"70ee1738b6b21e2c8a43f3a5ab0eee71"`); // Vitest will fill this automatically
    });

    it("should generate different hashes for different inputs", () => {
      // Arrange
      const text1 = "sample text 1";
      const text2 = "sample text 2";

      // Act
      const hash1 = service["generateTextHash"](text1);
      const hash2 = service["generateTextHash"](text2);

      // Assert
      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty string input", () => {
      // Arrange & Act
      const hash = service["generateTextHash"]("");

      // Assert
      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(32); // MD5 hash length
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
          }) as any
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
          }) as any
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

      // Używamy zdefiniowanego mocka bezpośrednio
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
      mockSendChatMessage.mockRejectedValueOnce(new Error("AI Service Error"));

      // Act & Assert
      await expect(service["callAiService"]("test")).rejects.toThrow("AI Service Error");
    });

    it("should handle invalid JSON response", async () => {
      // Arrange
      mockSendChatMessage.mockResolvedValueOnce("invalid json");

      // Act & Assert
      await expect(service["callAiService"]("test")).rejects.toThrow("Invalid JSON in API response");
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

      const mockGenerationMetadata = {
        id: "gen-123",
        duration: 1000,
        generated_count: 2,
      };

      vi.spyOn(service as any, "callAiService").mockResolvedValue(mockAiFlashcards);

      vi.spyOn(service as any, "saveGenerationMetadata").mockResolvedValue(mockGenerationMetadata);

      // Act
      const result = await service.generateFlashcards(inputText);

      // Assert
      expect(result).toEqual({
        generation_id: "gen-123",
        data: mockAiFlashcards,
        generated_count: 2,
      });
    });

    it("should handle AI service failure", async () => {
      // Arrange
      vi.spyOn(service as any, "callAiService").mockRejectedValue(new Error("AI Service Failed"));

      const logErrorSpy = vi.spyOn(service["logger"], "error");

      // Act & Assert
      await expect(service.generateFlashcards("test")).rejects.toThrow("AI Service Failed");

      expect(logErrorSpy).toHaveBeenCalled();
    });

    it("should handle metadata saving failure", async () => {
      // Arrange
      const mockAiFlashcards = [{ front: "Q1", back: "A1", source: "ai-full" as const }];

      vi.spyOn(service as any, "callAiService").mockResolvedValue(mockAiFlashcards);

      vi.spyOn(service as any, "saveGenerationMetadata").mockRejectedValue(new Error("Database Error"));

      // Act & Assert
      await expect(service.generateFlashcards("test")).rejects.toThrow("Database Error");
    });
  });
});
