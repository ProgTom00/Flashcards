import { Page, expect, Locator } from "@playwright/test";

export class FlashcardComponent {
  private readonly flashcard: Locator;
  private readonly acceptButton: Locator;
  private readonly rejectButton: Locator;
  private readonly editButton: Locator;
  private readonly removeButton: Locator;
  private readonly frontContent: Locator;
  private readonly backContent: Locator;

  constructor(
    private page: Page,
    private cardLocator: Locator
  ) {
    this.flashcard = cardLocator;
    this.acceptButton = cardLocator.locator('[data-testid="accept-button"]');
    this.rejectButton = cardLocator.locator('[data-testid="reject-button"]');
    this.editButton = cardLocator.locator('[data-testid="edit-button"]');
    this.removeButton = cardLocator.locator('[data-testid="remove-button"]');
    this.frontContent = cardLocator.locator('[data-testid="flashcard-front-content"]');
    this.backContent = cardLocator.locator('[data-testid="flashcard-back-content"]');
  }

  async accept() {
    await this.acceptButton.click();
  }

  async reject() {
    await this.rejectButton.click();
  }

  async edit() {
    await this.editButton.click();
  }

  async remove() {
    await this.removeButton.click();
  }

  async flip() {
    await this.flashcard.click();
  }

  async expectToBeVisible() {
    await expect(this.flashcard).toBeVisible();
  }

  async expectFrontContent(text: string) {
    await expect(this.frontContent).toContainText(text);
  }

  async expectBackContent(text: string) {
    await expect(this.backContent).toContainText(text);
  }

  async expectToBeFlipped() {
    await expect(this.flashcard).toHaveClass(/flipped/);
  }

  async expectAcceptButtonToBeVisible() {
    await expect(this.acceptButton).toBeVisible();
  }

  async expectRemoveButtonToBeVisible() {
    await expect(this.removeButton).toBeVisible();
  }
}
