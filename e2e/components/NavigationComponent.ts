import { Page, expect, Locator } from "@playwright/test";

export class NavigationComponent {
  private readonly suggestionsTab: Locator;
  private readonly acceptedTab: Locator;
  private readonly suggestionsContainer: Locator;
  private readonly acceptedContainer: Locator;
  private readonly bulkSaveButton: Locator;

  constructor(private page: Page) {
    this.suggestionsTab = page.locator('[data-testid="suggestions-tab-button"]');
    this.acceptedTab = page.locator('[data-testid="accepted-tab-button"]');
    this.suggestionsContainer = page.locator('[data-testid="suggestions-list-container"]');
    this.acceptedContainer = page.locator('[data-testid="accepted-flashcards-container"]');
    this.bulkSaveButton = page.locator('[data-testid="bulk-save-button"]');
  }

  async goToSuggestions() {
    await this.suggestionsTab.click();
  }

  async goToAccepted() {
    await this.acceptedTab.click();
  }

  async saveBulk() {
    await this.bulkSaveButton.click();
  }

  async expectSuggestionsCount(count: number) {
    await expect(this.suggestionsTab).toContainText(`Suggestions (${count})`);
  }

  async expectAcceptedCount(count: number) {
    await expect(this.acceptedTab).toContainText(`Accepted (${count})`);
  }

  async expectToBeInSuggestionsTab() {
    await this.goToSuggestions();
    await expect(this.suggestionsTab).toHaveClass(/bg-blue-100/);
    await expect(this.suggestionsContainer).toBeVisible();
  }

  async expectToBeInAcceptedTab() {
    await this.goToAccepted();
    await expect(this.acceptedTab).toHaveClass(/bg-green-100/);
    await expect(this.acceptedContainer).toBeVisible();
  }

  async expectBulkSaveButtonToBeVisible() {
    await expect(this.bulkSaveButton).toBeVisible();
  }

  async expectBulkSaveButtonToBeEnabled() {
    await expect(this.bulkSaveButton).toBeEnabled();
  }
}
