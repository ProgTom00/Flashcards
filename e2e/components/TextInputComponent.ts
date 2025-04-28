import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class TextInputComponent {
  private readonly textInput: Locator;

  constructor(private page: Page) {
    this.textInput = page.locator('[data-testid="flashcard-text-input"]');
  }

  async enterText(text: string) {
    await this.textInput.fill(text);
  }

  async clearText() {
    await this.textInput.clear();
  }

  async getText() {
    return await this.textInput.inputValue();
  }

  async expectToBeEnabled() {
    await expect(this.textInput).toBeEnabled();
  }

  async expectToBeDisabled() {
    await expect(this.textInput).toBeDisabled();
  }

  async expectPlaceholderText(text: string) {
    await expect(this.textInput).toHaveAttribute("placeholder", text);
  }
}
