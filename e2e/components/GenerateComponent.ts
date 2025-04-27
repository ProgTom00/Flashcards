import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class GenerateComponent {
  private readonly textInput: Locator;
  private readonly generateButton: Locator;
  private readonly loadingSpinner: Locator;

  constructor(private page: Page) {
    this.textInput = page.locator('[data-testid="flashcard-text-input"]');
    this.generateButton = page.locator('[data-testid="generate-button"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  }
  async enterText(text: string) {
    await this.textInput.waitFor({ state: "visible", timeout: 5000 });
    await this.textInput.fill(text);
  }

  async generateFlashcards() {
    await this.generateButton.click();
  }

  async expectGenerateButtonToBeEnabled() {
    await expect(this.generateButton).toBeEnabled();
  }

  async expectGenerateButtonToBeDisabled() {
    await expect(this.generateButton).toBeDisabled();
  }

  async expectLoadingSpinnerToBeVisible() {
    await expect(this.loadingSpinner).toBeVisible();
  }

  async expectLoadingSpinnerToBeHidden() {
    await expect(this.loadingSpinner).toBeVisible();
  }

  async expectTextInputToHaveLength(length: number) {
    const text = await this.textInput.inputValue();
    expect(text.length).toBe(length);
  }
}
