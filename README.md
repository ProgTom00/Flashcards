# 10x-cards

Welcome to the 10x-cards project! This application is designed to help users quickly create, manage, and review educational flashcards, leveraging AI-powered suggestions to streamline the flashcard creation process.

## Table of Contents
- [1. Project Description](#1-project-description)
- [2. Tech Stack](#2-tech-stack)
- [3. Getting Started Locally](#3-getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
- [4. Available Scripts](#4-available-scripts)
- [5. Project Scope](#5-project-scope)
  - [In Scope (MVP)](#in-scope-mvp)
  - [Out of Scope (MVP)](#out-of-scope-mvp)
- [6. Project Status](#6-project-status)
- [7. License](#7-license)

## Project Description
10x-cards is a web-based application that enables users to:
- Automatically generate flashcards by pasting text and receiving AI-driven suggestions.
- Manually create and manage flashcards.
- Review flashcards in a structured learning session based on spaced repetition.
- Manage user authentication and personal flashcard data securely.

The app aims to reduce the time and effort required to create high-quality flashcards, making learning more efficient and accessible.

## Tech Stack
- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, authentication, and backend-as-a-service)
- **AI Integration:** Openrouter.ai for accessing multiple LLM models (OpenAI, Anthropic, Google, etc.)
- **CI/CD & Hosting:** GitHub Actions for CI/CD pipelines and DigitalOcean for hosting via Docker

## Getting Started Locally
### Prerequisites

-   **Node.js:** Version `22.14.0` is required. We recommend using a Node version manager like [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm). If you have one installed, you can run `nvm use` or `fnm use` in the project directory to switch to the correct version specified in `.nvmrc`.
-   **Package Manager:** npm (included with Node.js), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/). The examples below use `npm`.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ProgTom00/Flashcards.git
    cd 10x-cards
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project. You will need credentials for Supabase and Openrouter.ai.
    ```dotenv
    # .env

    # Supabase credentials (replace with your actual Supabase project details)
    PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

    # Openrouter.ai API Key (replace with your actual key)
    OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY

    # Add any other necessary environment variables here
    ```

### Running the Development Server

Once dependencies are installed and environment variables are set, you can start the development server:

```bash
npm run dev
```

This command will start the Astro development server, typically available at `http://localhost:3000

## Available Scripts
- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the project for production.
- **`npm run preview`**: Previews the production build.
- **`npm run lint`**: Runs ESLint to check for code issues.
- **`npm run lint:fix`**: Runs ESLint and attempts to automatically fix issues.
- **`npm run format`**: Formats the code using Prettier.

## Project Scope
The project includes the following key features:
- **Automated Flashcard Generation:** Generate flashcard suggestions from pasted text using LLM APIs.
- **Manual Create, Edit or Delete Flashcard Management:** Create, edit, and delete flashcards manually.
- **Learning Sessions:** Review flashcards using an external spaced repetition algorithm.
- **User Management:** Secure registration, login, and data handling in compliance with privacy regulations (e.g., GDPR).
- **Spaced Repetition:** Integration with a ready-made spaced repetition algorithm library for learning sessions.
- **Secure Storage data:** Secure storage of user data and flashcards (GDPR compliant).
- **Statistics Collection:** Track the number of generated and accepted flashcards.

**Out of Scope (for MVP):**
- Advanced spaced repetition algorithms beyond the chosen open-source solution.
- Gamification elements.
- Mobile applications.
- Integration with multiple file formats (e.g., PDF, DOCX) for flashcard import.
- Public API access and advanced notification systems.
- Sharing flashcard sets between users.
- Advanced notification systems.
- Advanced keyword search for flashcards.

## Project Status
This project is currently in the MVP stage and under active development. Core functionalities have been implemented, with plans for future enhancements based on user feedback.
