import { test } from "@playwright/test";
import { GenerateComponent } from "./components/GenerateComponent";
import { NavigationComponent } from "./components/NavigationComponent";
import { FlashcardComponent } from "./components/FlashcardComponent";
import { NotificationComponent } from "./components/NotificationComponent";

test.describe("Flashcard Generation Flow", () => {
  // Use authentication state for all tests in this file
  test.use({ storageState: "./playwright/.auth/user.json" });

  test("should generate and save flashcards", async ({ page }) => {
    // Arrange
    const generateComponent = new GenerateComponent(page);
    const navigationComponent = new NavigationComponent(page);
    const notificationComponent = new NotificationComponent(page);

    // Navigate to generate page
    await page.goto("/generate");

    // Test text input validation (less than 1000 characters)
    const shortText = "A".repeat(999);
    await generateComponent.enterText(shortText);
    await generateComponent.expectGenerateButtonToBeDisabled();

    // Test text input validation (valid length)
    const validText = `
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
      nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
      eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt 
      in culpa qui officia deserunt mollit anim id est laborum.
      
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
      doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
      veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    `.repeat(2); // Ensure text is over 1000 characters

    await generateComponent.enterText(validText);
    await generateComponent.expectGenerateButtonToBeEnabled();

    // Generate flashcards
    await generateComponent.generateFlashcards();
    await generateComponent.expectLoadingSpinnerToBeVisible();
    await generateComponent.expectLoadingSpinnerToBeHidden();

    // Verify suggestions are displayed
    await navigationComponent.expectToBeInSuggestionsTab();

    // Accept first flashcard
    const firstFlashcard = new FlashcardComponent(
      page,
      page.locator('[data-testid="suggestions-list-container"] .grid > div').first()
    );
    await firstFlashcard.expectToBeVisible();
    await firstFlashcard.accept();

    // Verify flashcard moved to accepted tab
    await navigationComponent.expectAcceptedCount(1);

    // Go to accepted tab and save
    await navigationComponent.goToAccepted();
    await navigationComponent.expectToBeInAcceptedTab();
    await navigationComponent.expectBulkSaveButtonToBeVisible();
    await navigationComponent.expectBulkSaveButtonToBeEnabled();
    await navigationComponent.saveBulk();

    // Verify save success later
    // await notificationComponent.expectSuccessMessage("Successfully saved");
    // await notificationComponent.expectNotificationToDisappear();

    // Verify accepted list is cleared after save
    await navigationComponent.expectAcceptedCount(0);
  });
});
