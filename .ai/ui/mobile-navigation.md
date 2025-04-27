# Mobile Navigation Specification

## Overview
This document outlines the business requirements for adapting the flashcard generation interface for mobile devices. The changes will focus on improving the user experience on smaller screens while preserving the existing desktop functionality.

## Technology Stack Context
As outlined in the tech stack documentation, our frontend is built with:
- Astro 5 with React 19 for interactive components
- TypeScript 5 for static typing
- Tailwind 4 for responsive styling
- Shadcn/ui component library

## Component Requirements

### GenerateView
- The current two-column layout should collapse to a single column on mobile screens
- Content prioritization: The text input area should appear first, followed by the flashcard management section
- The sticky positioning of the input area should be adjusted for mobile viewing
- Tab navigation between "Suggestions" and "Accepted" should remain accessible and intuitive on smaller screens

### FlashcardModal
- The modal should be fully responsive and properly sized on mobile screens
- Touch gestures should be supported for flipping cards (in addition to space key)
- Close buttons and controls should be easily accessible on touch devices
- The keyboard shortcut indicators should be hidden or modified on touch-only devices

### TextAreaInput
- The text area should maintain proper proportions on smaller screens
- The character counter and validation messages should be clearly visible
- The autosave functionality should work identically on mobile
- Touch keyboard interactions should be accounted for

### SuggestionsList
- The dual-column grid should collapse to a single column on mobile screens
- Flashcard suggestion cards should be fully visible without horizontal scrolling
- Accept/Edit/Reject actions should be easily accessible via touch
- Consider implementing swipe gestures for common actions (accept/reject)

## Navigation Requirements
- Implement smooth transitions between the text input and flashcard management sections on mobile
- Consider adding a floating action button or sticky navigation element to switch between sections
- Ensure all interactive elements meet minimum touch target size requirements (at least 44×44 pixels)
- Maintain visual consistency with the desktop experience

## Constraints
- All existing functionality must be preserved
- No changes to the data flow or API integrations
- The desktop panel behavior and layout must remain unchanged
- Performance on mobile devices must be optimized to prevent lag when interacting with flashcards

## Success Criteria
- The interface is fully usable on mobile devices with screens as small as 320px wide
- Users can efficiently generate, review, and manage flashcards on mobile devices
- The application maintains visual consistency across device sizes
- No regression in desktop functionality 