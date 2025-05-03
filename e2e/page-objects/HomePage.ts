import { type Page, type Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createFlashcardButton: Locator;
  readonly flashcardsList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.createFlashcardButton = page.getByRole("button", { name: /create flashcard/i });
    this.flashcardsList = page.locator(".flashcards-list");
  }

  async goto() {
    await this.page.goto("/");
  }

  async createNewFlashcard() {
    await this.createFlashcardButton.click();
  }

  async getFlashcardsCount() {
    const items = this.page.locator(".flashcard-item");
    return await items.count();
  }

  async searchFlashcards(query: string) {
    const searchInput = this.page.getByPlaceholder("Search flashcards");
    await searchInput.fill(query);
    await searchInput.press("Enter");
  }
}
