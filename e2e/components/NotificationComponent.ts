import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class NotificationComponent {
  private readonly notification: Locator;
  // private readonly loadingSpinner: Locator;

  constructor(private page: Page) {
    this.notification = page.locator('[data-testid="notification"]');
    // this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  }

  async expectSuccessMessage(message: string) {
    // First wait for loading to complete
    // await expect(this.loadingSpinner).toBeHidden();
    // Then wait for notification with a shorter timeout since loading is done
    await this.notification.waitFor({ state: "visible", timeout: 5000 });
    await expect(this.notification).toHaveClass(/bg-green-100/);
    await expect(this.notification).toContainText(message);
  }

  async expectErrorMessage(message: string) {
    // First wait for loading to complete
    // await expect(this.loadingSpinner).toBeHidden();
    // Then wait for notification with a shorter timeout since loading is done
    await this.notification.waitFor({ state: "visible", timeout: 5000 });
    await expect(this.notification).toHaveClass(/bg-red-100/);
    await expect(this.notification).toContainText(message);
  }

  async expectNotificationToDisappear() {
    await expect(this.notification).toBeHidden({ timeout: 5500 }); // 5s + 500ms buffer
  }
}
