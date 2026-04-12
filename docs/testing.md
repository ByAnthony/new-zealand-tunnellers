# Testing

## Testing tools

### 1. Jest + React Testing Library

Used for unit, helper, and component-level testing. Tests are written from the user's perspective where possible, with targeted mocking for framework and browser-only dependencies such as Next.js, Leaflet, and `visualViewport`.

### 2. Playwright

Used for end-to-end testing in a real browser. These tests cover multi-page flows, URL state, and integration between the UI, the app router, and the production build.

## Test structure

```bash
__tests__/
├── e2e/
│   ├── books.spec.ts
│   ├── footer.spec.ts
│   ├── history.spec.ts
│   ├── home.spec.ts
│   ├── menu.spec.ts
│   ├── tunneller.spec.ts
│   ├── tunnellers.spec.ts
│   └── works-map.spec.ts
└── unit/
    ├── components/
    │   ├── Menu/
    │   ├── Roll/
    │   ├── Timeline/
    │   └── WorksMap/
    └── utils/
        ├── helpers/
        └── database/
```

## Current coverage focus

### Unit and component tests

Current unit coverage includes:

- shared date and helper utilities
- menu search behavior
- roll filters and URL synchronization
- timeline helper behavior
- `WorksMap` filter application, selection cleanup, deep-link restore, and front-line-aware map fitting

### E2E tests

Current browser coverage includes:

- homepage, history, footer, and books navigation
- menu search and language switching
- tunneller list filtering, pagination, back-link behavior, and mobile filter badge behavior
- profile navigation
- `WorksMap` period switching, deep-link visibility handling, and clearing hidden selections

## Running tests

### Unit and component tests

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

Notes:

- Test files usually live in `*.test.ts` and `*.test.tsx`
- Jest enforces global coverage thresholds for the whole repository
- Because of that, a focused Jest run can show passing tests but still exit non-zero if the global coverage threshold is not met

### E2E tests

```bash
npx playwright test
```

Interactive runner:

```bash
npm run playwright:ui
```

Notes:

- Playwright uses the local production server defined in [`playwright.config.ts`](../playwright.config.ts)
- The test suite starts the app with `npm run start`
- Chromium-only runs are useful for faster local checks:

```bash
npx playwright test __tests__/e2e/menu.spec.ts --project=chromium
```

## Practical guidance

- Prefer unit tests for pure helpers and state-heavy components
- Prefer Playwright when behavior depends on router state, browser layout, or end-to-end integration
- For `WorksMap`, keep most coverage at the unit level and add E2E tests only for the highest-risk flows
