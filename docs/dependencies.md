# Project Dependencies Documentation

This document outlines the dependencies used in the New Zealand Tunnellers project, categorized by their purpose and usage.

## Production Dependencies

### Core Framework & Runtime

- **`next`**: React-based web framework for production applications with server-side rendering;
- **`react`**: JavaScript library for building user interfaces;
- **`react-dom`**: React package for working with the DOM;

### Server & Database

- **`mysql2`**: Fast MySQL driver for Node.js with Promise support;
- **`ts-node`**: TypeScript execution environment for Node.js;
- **`cross-env`**: Cross-platform environment variable setting.

### UI Components & Styling

- **`sass`**: CSS preprocessor for enhanced styling capabilities;
- **`rc-slider`**: React slider component for interactive filter controls.

### Utilities & Tools

- **`lodash`**: Utility library for common programming tasks (used for deep object comparison);
- **`sharp`**: High-performance image processing library for Next.js Image optimization;
- **`prettier`**: Code formatting tool for consistent code style.

### Development Server

- **`nodemon`**: Development server that auto-restarts on file changes.

## Development Dependencies

### Testing Framework

- **`jest`**: JavaScript testing framework for unit tests;
- **`jest-environment-jsdom`**: DOM environment for Jest tests;
- **`@testing-library/react`**: React testing utilities with modern React support;
- **`@testing-library/jest-dom`**: Custom Jest matchers for DOM elements;
- **`@playwright/test`**: End-to-end testing framework for browser automation;

### Code Quality & Linting

- **`eslint`**: JavaScript/TypeScript linting utility;
- **`eslint-config-next`**: ESLint configuration optimized for Next.js projects;
- **`eslint-config-prettier`**: Disables ESLint rules that conflict with Prettier;
- **`eslint-plugin-import`**: ESLint plugin for import/export syntax validation;
- **`eslint-plugin-react-hooks`**: ESLint rules for React Hooks best practices;
- **@eslint/js, globals@16.4.0**: ESLint base config helpers.

### TypeScript Type Definitions

- **`typescript`**: TypeScript compiler for static type checking.
- **`@types/jest`**: Type definitions for Jest testing framework;
- **`@types/lodash`**: Type definitions for Lodash utility library;
- **`@types/node`**: Type definitions for Node.js runtime. **Keep in sync with `.nvmrc` version**;
- **`@types/react`**: Type definitions for React library;
- **`@types/react-dom`**: Type definitions for React DOM.

### Git Workflow & Automation

- **`husky`**: Git hooks management for pre-commit validation;
- **`lint-staged`**: Run linters on staged files only for faster commits.

## Package Scripts

### Development Workflow

```json
{
  // Start development server with hot reload
  "dev": "nodemon",
  // Build for production
  "build": "next build && tsc:-project tsconfig.server.json",
  // Start production server
  "start": "cross-env NODE_ENV=production node dist/server.js"
}
```

### Code Quality

```json
{
  // Run ESLint on codebase
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  // Format code with Prettier
  "prettier": "npx prettier .:-write"
}
```

### Testing

```json
{
  // Run Jest unit tests
  "test": "jest",
  // Run Jest in watch mode
  "test:watch": "jest:-watch",
  // Run Playwright E2E tests with UI
  "playwright:ui": "npx playwright test:-ui"
}
```

### Git Hooks

```json
{
  // Setup Husky git hooks
  "prepare": "husky || true"
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint . --fix"
    ]
  }
}
```
