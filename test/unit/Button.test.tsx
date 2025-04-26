import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../../src/components/ui/button";

describe("Button component", () => {
  it("renders with correct text", () => {
    // Arrange
    render(<Button>Click me</Button>);

    // Act
    const button = screen.getByRole("button", { name: /click me/i });

    // Assert
    expect(button).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    // Arrange
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: /click me/i });

    // Act
    await user.click(button);

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("respects disabled prop", async () => {
    // Arrange
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    );
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: /click me/i });

    // Act
    await user.click(button);

    // Assert
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });
});
