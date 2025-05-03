import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class NotificationComponent {
  private readonly notification: Locator;
  // private readonly loadingSpinner: Locator;

  constructor(private page: Page) {
    this.notification = page.locator('[data-testid="notification"]');
  }

  async expectSuccessMessage(message?: string) {
    // Use a longer timeout since generation can take more than 10 seconds
    await expect(this.notification).toBeVisible({ timeout: 30000 });
    await expect(this.notification).toHaveClass(/bg-green-100/);
    if (message) {
      await expect(this.notification).toContainText(message);
    }
  }

  async expectErrorMessage(message: string) {
    // Use the same longer timeout for consistency
    await expect(this.notification).toBeVisible({ timeout: 30000 });
    await expect(this.notification).toHaveClass(/bg-red-100/);
    await expect(this.notification).toContainText(message);
  }

  async expectNotificationToDisappear() {
    // Keep a shorter timeout for disappearance since that should happen quickly
    await expect(this.notification).toBeHidden({ timeout: 10000 });
  }
}
