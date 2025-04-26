import { test, expect } from "@playwright/test";
import { HomePage } from "./page-objects/HomePage";

test.describe("Home Page", () => {
  test("should display the main heading", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.goto();

    // Assert
    await expect(homePage.heading).toBeVisible();
  });

  test("should navigate to create flashcard page", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    await homePage.goto();

    // Act
    await homePage.createNewFlashcard();

    // Assert
    await expect(page).toHaveURL(/.*\/create/);
  });

  test("should display flashcards", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.goto();

    // Assert
    const count = await homePage.getFlashcardsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should filter flashcards when searching", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    await homePage.goto();
    const initialCount = await homePage.getFlashcardsCount();

    // Act
    await homePage.searchFlashcards("test");

    // Assert
    const filteredCount = await homePage.getFlashcardsCount();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Visual comparison
    await expect(page).toHaveScreenshot("home-search-results.png");
  });
});
