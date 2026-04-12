# Testing

## Testing Tools

### 1. React Testing Library

Used for unit and component-level testing of React components. Encourages testing from the user’s perspective rather than implementation details.

### 2. Playwright

Used for end-to-end (E2E) testing. Automates browser-based tests to simulate real user flows and validate integration across the system.

## Test structure

```bash
__tests__/
│
├── unit/                     # Jest + React Testing Library tests
│   ├── components/           # Component-specific tests
│   │   ├── Books/
│   │   ├── Menu/
│   │   ├── Roll/
│   │   └── WorksMap/
│   ├── utils/                # Shared testing helpers and mocks
│   └── content/
│
└── e2e/                      # Playwright end-to-end tests
    ├── home.spec.ts
    ├── menu.spec.ts
    ├── tunneller.spec.ts
    ├── tunnellers.spec.ts
    └── works-map.spec.ts

```

## Running Tests

### Unit/Component Tests ([React Testing Library](https://github.com/testing-library/react-testing-library))

```bash
npm run test
# or with watch mode
npm run test:watch
```

- Tests live in files like \*.test.tsx;
- Uses Jest under the hood.
- The repo enforces global coverage thresholds in `jest.config.ts`, so a focused run can still exit non-zero even when the selected test files pass.

### E2E Tests ([Playwright](https://github.com/microsoft/playwright))

```bash
npx playwright test
```

- Starts the browser and runs E2E scripts;
- Starts the local app using the `webServer` config in `playwright.config.ts`;
- Use `npm run playwright:ui` for an interactive test runner.
