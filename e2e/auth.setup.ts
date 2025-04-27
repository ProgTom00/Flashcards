import { test as setup, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const authFile = path.join(__dirname, "../playwright/.auth/user.json");

const E2E_USERNAME = process.env.E2E_USERNAME;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

if (!E2E_USERNAME || !E2E_PASSWORD) {
  throw new Error("E2E_USERNAME and E2E_PASSWORD must be set");
}

setup("authenticate", async ({ page, baseURL }) => {
  try {
    // Navigate to login page and wait for it to load
    console.log("Starting authentication test");
    console.log("Base URL:", baseURL);

    console.log("Navigating to login page");
    await page.goto(`${baseURL}/auth/login`);

    // Add debug logging
    console.log("Current URL:", page.url());
    console.log("Checking if page is available...");
    await page.waitForLoadState("networkidle");
    console.log("Page loaded");

    // Wait for and fill email input with increased timeout
    console.log("Looking for email input");
    const emailInput = page.locator('input[data-testid="auth-input-email"]');
    await emailInput.waitFor({ state: "visible", timeout: 60000 });
    await emailInput.click();
    await emailInput.fill(E2E_USERNAME);
    await expect(emailInput).toHaveValue(E2E_USERNAME);

    // Wait for and fill password input
    console.log("Filling password input");
    const passwordInput = page.locator('input[data-testid="auth-input-password"]');
    await passwordInput.waitFor({ state: "visible" });
    await passwordInput.click();
    await passwordInput.fill(E2E_PASSWORD);
    await expect(passwordInput).toHaveValue(E2E_PASSWORD);

    // Wait for and click submit button
    console.log("Clicking submit button");
    const submitButton = page.locator('button[data-testid="auth-submit-button"]');
    await submitButton.waitFor({ state: "visible" });
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle" }), submitButton.click()]);

    // Wait for successful navigation and verify we're logged in
    console.log("Verifying we're logged in");
    await expect(page.getByRole("heading", { name: "Generate Flashcards", level: 1 })).toBeVisible({
      timeout: 10000,
    });

    // Verify access to generate functionality
    console.log("Verifying access to generate functionality");
    const generateButton = page.locator('button[data-testid="generate-button"]');
    await expect(generateButton).toBeVisible();

    // Store authentication state
    console.log("Storing authentication state");
    await page.context().storageState({ path: authFile });
  } catch (error) {
    console.error("Test failed with error:", error);
    throw error;
  }
});
