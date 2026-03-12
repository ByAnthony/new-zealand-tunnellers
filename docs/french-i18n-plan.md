# French Internationalisation Plan

This document outlines everything needed to add a French (`/fr`) version of the app alongside the existing English (`/en`) version.

---

## Overview

The work splits into four areas:

1. **Database** — add `_fr` columns to all translatable lookup tables and article content tables
2. **Query layer** — pass `locale` into every query function and select the right column dynamically
3. **App routing** — restructure `app/` with a `[locale]` segment using `next-intl`
4. **UI strings** — extract ~30 hardcoded English labels into translation JSON files

URLs will become `/en/...` and `/fr/...`. The default locale (`en`) can optionally redirect from `/`.

---

## Phase 1 — Database

### 1.1 Lookup tables — add `_fr` columns

Every table that already has an `_en` column needs a matching `_fr` column.

| Table                    | New column                                           |
| ------------------------ | ---------------------------------------------------- |
| `country`                | `country_fr`                                         |
| `occupation`             | `occupation_fr`                                      |
| `rank`                   | `rank_fr`                                            |
| `marital_status`         | `marital_status_fr`                                  |
| `corps`                  | `corps_fr`                                           |
| `embarkation_unit`       | `embarkation_unit_fr`                                |
| `section`                | `section_fr`                                         |
| `death_type`             | `death_type_fr`                                      |
| `death_cause`            | `death_cause_fr`                                     |
| `death_circumstances`    | `death_circumstances_fr`                             |
| `death_location`         | `death_location_fr`                                  |
| `cemetery`               | `cemetery_name_fr`                                   |
| `medal`                  | `medal_name_fr`                                      |
| `medal_citation`         | `medal_citation_fr`                                  |
| `conflict`               | `conflict_name_fr`                                   |
| `training_location_type` | `training_location_type_fr`                          |
| `transferred_to`         | `transferred_to_fr`                                  |
| `event_join`             | `event_fr`                                           |
| `company_events`         | `company_events_event_fr`, `company_events_title_fr` |

### 1.2 Article and About Us content — add `_fr` columns

These tables use plain `title`/`text` columns (no `_en` suffix). Add French columns without renaming the existing English ones.

| Table              | New columns           |
| ------------------ | --------------------- |
| `article`          | `title_fr`            |
| `article_section`  | `title_fr`, `text_fr` |
| `about_us`         | `title_fr`            |
| `about_us_section` | `title_fr`, `text_fr` |

> The queries for these tables will use `title` / `text` when locale is `en`, and `title_fr` / `text_fr` when locale is `fr`.

---

## Phase 2 — Query layer

### 2.1 Add `locale` parameter to every query function

Each query function receives `locale: 'en' | 'fr'` and uses it to select the right column.

**Example — `tunnellerQuery.ts`:**

```ts
export const tunnellerQuery = async (
  id: string,
  locale: "en" | "fr", // ← add this
  connection: PoolConnection,
) => {
  const query = `SELECT
    , birth_country.country_${locale} AS birth_country
    , rank.rank_${locale} AS rank
    , occupation.occupation_${locale} AS occupation
    -- ... all other _en columns follow the same pattern
  `;
};
```

The returned column aliases (`AS birth_country`, `AS rank`, etc.) stay the same, so all TypeScript types and components are unaffected.

**Example — `historyChapterQuery.ts` (no `_en` suffix today):**

```ts
const titleCol = locale === "en" ? "title" : "title_fr";
const textCol = locale === "en" ? "text" : "text_fr";

const query = `SELECT article.${titleCol} AS title ...`;
```

### 2.2 Files to update

| File                      | Columns affected                                      |
| ------------------------- | ----------------------------------------------------- |
| `tunnellerQuery.ts`       | 18 `_en` columns                                      |
| `rollQuery.ts`            | `embarkation_unit_en`, `rank_en`, `attached_corps_en` |
| `armyExperienceQuery.ts`  | `country_en`, `conflict_name_en`                      |
| `medalsQuery.ts`          | `medal_name_en`, `country_en`, `medal_citation_en`    |
| `tunnellerEventsQuery.ts` | `event_en`                                            |
| `companyEventsQuery.ts`   | `company_events_event`, `company_events_title`        |
| `historyChapterQuery.ts`  | `title`, `text` (article + section)                   |
| `homepageQuery.ts`        | `article.title`                                       |
| `aboutUsQuery.ts`         | `title`, `text` (about_us + section)                  |

### 2.3 Thread `locale` through the data layer

`locale` flows from the URL param down to every query:

```
Page (params.locale)
  → getData(id, locale)
    → getTunneller(id, locale, connection)
      → tunnellerQuery(id, locale, connection)
      → medalsQuery(id, locale, connection)
      → tunnellerEventsQuery(id, locale, connection)
      → ...
```

### 2.4 Hardcoded English strings in `getTunneller.ts`

Three event titles are hardcoded in `utils/database/getTunneller.ts` and need to become locale-aware:

```ts
title: "Transfer to England"; // → t('transferToEngland')
title: "Transfer to New Zealand"; // → t('transferToNewZealand')
title: "Transferred"; // → t('transferred')
```

These should be moved into the translation JSON files (see Phase 4).

---

## Phase 3 — App routing

### 3.1 Install `next-intl`

```bash
npm install next-intl
```

### 3.2 Add `middleware.ts` at the project root

```ts
import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en",
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

### 3.3 Restructure `app/`

Move all routes under a `[locale]` segment:

```
app/
  layout.tsx                  ← minimal root layout (just <html><body>)
  [locale]/
    layout.tsx                ← current layout.tsx moves here
    page.tsx
    tunnellers/
      [id]/
        page.tsx
    history/
      [id]/
        page.tsx
    books/
      page.tsx
    about-us/
      page.tsx
```

The `[locale]/layout.tsx` reads the locale and sets `<html lang={locale}>`.

### 3.4 Update `next.config.mjs`

```js
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  trailingSlash: true,
  basePath: "",
  assetPrefix: "",
  images: {
    loader: "custom",
    loaderFile: "./utils/imageLoader.ts",
  },
};

export default withNextIntl(nextConfig);
```

### 3.5 Add a language switcher to the menu

Add a link in the `Menu` component that toggles between `/en/[current-path]` and `/fr/[current-path]`.

---

## Phase 4 — UI strings

### 4.1 Create translation files

```
messages/
  en.json
  fr.json
```

**`messages/en.json`:**

```json
{
  "nav": {
    "history": "History",
    "tunnellers": "Tunnellers",
    "aboutUs": "About Us"
  },
  "profile": {
    "serial": "Serial",
    "rank": "Rank",
    "born": "Born",
    "settledInNz": "Settled in New Zealand",
    "personalLife": "Personal Life",
    "work": "Work",
    "armyExperience": "Army Experience",
    "occupation": "Occupation",
    "employer": "Employer",
    "residence": "Residence",
    "maritalStatus": "Marital Status",
    "wife": "Wife",
    "mother": "Mother",
    "father": "Father",
    "detachments": "Detachments",
    "corps": "Corps",
    "unit": "Unit",
    "sources": "Sources",
    "death": "Death",
    "notes": "Notes",
    "seeAllTunnellers": "See all Tunnellers",
    "transferToEngland": "Transfer to England",
    "transferToNewZealand": "Transfer to New Zealand",
    "transferred": "Transferred"
  },
  "roll": {
    "birthYears": "Birth Years",
    "deathYears": "Death Years",
    "ranks": "Ranks",
    "noResults": "Sorry, no profile matches your filters"
  }
}
```

### 4.2 Use translations in components

```tsx
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('nav');
  return (
    <Link href="/history">{t('history')}</Link>
    <Link href="/tunnellers">{t('tunnellers')}</Link>
    <Link href="/about-us">{t('aboutUs')}</Link>
  );
}
```

---

## Checklist

### Database

- [ ] Add `_fr` columns to all 19 lookup tables listed in Phase 1.1
- [ ] Add `_fr` columns to article/about-us content tables (Phase 1.2)
- [ ] Fill in French translations for all lookup data
- [ ] Fill in French translations for all article and about-us content

### Query layer

- [ ] Add `Locale` type (`'en' | 'fr'`) to shared types
- [ ] Update `tunnellerQuery.ts`
- [ ] Update `rollQuery.ts`
- [ ] Update `armyExperienceQuery.ts`
- [ ] Update `medalsQuery.ts`
- [ ] Update `tunnellerEventsQuery.ts`
- [ ] Update `companyEventsQuery.ts`
- [ ] Update `historyChapterQuery.ts`
- [ ] Update `homepageQuery.ts`
- [ ] Update `aboutUsQuery.ts`
- [ ] Update `getTunneller.ts` to accept and thread `locale`
- [ ] Thread `locale` from `params` in all page files

### App routing

- [ ] Install `next-intl`
- [ ] Add `middleware.ts`
- [ ] Restructure `app/` with `[locale]` segment
- [ ] Update `next.config.mjs`
- [ ] Add language switcher to `Menu`
- [ ] Update `<html lang>` attribute to use locale

### UI strings

- [ ] Create `messages/en.json`
- [ ] Create `messages/fr.json`
- [ ] Replace hardcoded strings in `Footer.tsx`
- [ ] Replace hardcoded strings in `Menu` components
- [ ] Replace hardcoded strings in `Profile` and sub-components
- [ ] Replace hardcoded strings in `Roll.tsx` and filter components
- [ ] Replace hardcoded strings in `Article` components
