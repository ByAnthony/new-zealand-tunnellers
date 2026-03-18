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
├── unit/                # React Testing Library tests
│   ├── components/      # Component-specific tests
│   └── utils/           # Utility functions
│
└── e2e/                 # Playwright tests
    ├── home.spec.ts     # Example: homepage flow
    └── login.spec.ts    # Example: login behavior

```

## Running Tests

### Unit/Component Tests ([React Testing Library](https://github.com/testing-library/react-testing-library))

```bash
npm run test
# or with watch mode
npm run test:watch
```

- Tests live in files like \*.test.tsx;
- Uses jest under the hood.

### E2E Tests ([Playwright](https://github.com/microsoft/playwright))

```bash
npx playwright test
```

- Starts the browser and runs E2E scripts;
- Use `npm run playwright:ui` for an interactive test runner.
