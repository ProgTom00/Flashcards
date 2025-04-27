import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class NotificationComponent {
  private readonly notification: Locator;
  // private readonly loadingSpinner: Locator;

  constructor(private page: Page) {
    this.notification = page.locator('[data-testid="notification"]');
  }

  async expectSuccessMessage(message?: string) {
    // Then wait for notification with a longer timeout
    await this.notification.waitFor({ state: "visible", timeout: 10000 });
    await expect(this.notification).toHaveClass(/bg-green-100/);
    if (message) {
      await expect(this.notification).toContainText(message);
    }
  }

  async expectErrorMessage(message: string) {
    // Then wait for notification with a longer timeout
    await this.notification.waitFor({ state: "visible", timeout: 10000 });
    await expect(this.notification).toHaveClass(/bg-red-100/);
    await expect(this.notification).toContainText(message);
  }

  async expectNotificationToDisappear() {
    await expect(this.notification).toBeHidden({ timeout: 10000 }); // 10s timeout
  }
}
