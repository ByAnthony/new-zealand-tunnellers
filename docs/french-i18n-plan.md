# French Internationalisation Plan

This document outlines everything needed to add a French (`/fr`) version of the app alongside the existing English (`/en`) version.

---

## Overview

The work splits into four areas across four PRs:

1. **App routing + EN translations** (PR 1) — restructure `app/` with `[locale]`, wire up `next-intl` with `messages/en.json`; English URLs unchanged, full translation pipeline validated
2. **Query layer** (PR 2) — pass `locale` into every query function; hardcoded to `'en'`, pure refactor
3. **French data** (PR 3a) — add `_fr` DB columns, fill translations, enable `/fr/` routes
4. **French UI strings** (PR 3b) — add `messages/fr.json` and a language switcher; no other code changes

URLs for French will become `/fr/...`. English URLs stay exactly as they are today (no `/en/` prefix). `next-intl` handles this via `localePrefix: 'as-needed'`.

---

## Recommended PR split

Split the work into three independent, reviewable PRs:

**PR 1 — Routing restructure + EN translations (no URL changes)**

- Install `next-intl`
- Add `middleware.ts` with `locales: ['en']` only
- Move `app/*` → `app/[locale]/*`
- Update `next.config.mjs`
- Create `messages/en.json` and replace all hardcoded UI labels with `useTranslations`
- English URLs are completely unchanged; validates the full translation pipeline before any French work

**PR 2 — Thread `locale` through the query layer**

- Add `Locale` type
- Add `locale` param to all query functions (receives `'en'` from `params.locale`)
- Pure refactor: no DB changes, no UI changes, identical output

**PR 3a — French data**

- Add `_fr` DB columns and fill translations
- Add `fr` to middleware locales
- French pages render at `/fr/...` with French data values; UI labels remain in English for now

**PR 3b — French UI strings + language switcher**

- Create `messages/fr.json` (pure content file, no code changes)
- Add language switcher to `Menu`

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
title: "Transfer to England";
title: "Transfer to New Zealand";
title: "Transferred";
```

Since `getTunneller.ts` is a plain async data function (not a React component), avoid pulling `next-intl` into the data layer. Use a simple locale conditional directly:

```ts
title: locale === "fr" ? "Transfert en Angleterre" : "Transfer to England";
title: locale === "fr"
  ? "Transfert en Nouvelle-Zélande"
  : "Transfer to New Zealand";
title: locale === "fr" ? "Transféré" : "Transferred";
```

This keeps `next-intl` confined to the component layer where it belongs. These strings do **not** need to go into `messages/*.json`.

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
  localePrefix: "as-needed", // English keeps existing URLs, French gets /fr/ prefix
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

With this configuration:

- `/tunnellers/123` → English (unchanged)
- `/fr/tunnellers/123` → French

The `[locale]` segment in `app/` is an internal Next.js detail — it never appears in English URLs.

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
      kiwis-dig-tunnels-too/
        [id]/
          page.tsx            ← keep as-is for now
      les-kiwis-aussi-creusent-des-tunnels/
        [id]/
          page.tsx            ← keep as-is for now
      page.tsx
    about-us/
      page.tsx
```

The `[locale]/layout.tsx` reads the locale and sets `<html lang={locale}>`.

> The two book routes can eventually be unified into `[slug]/[id]`, but this is not required for i18n to work. Defer that cleanup to a later PR.

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

Add a link in the `Menu` component that toggles between the current path and `/fr/[current-path]` (or back to the unprefixed English path).

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
    "seeAllTunnellers": "See all Tunnellers"
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

### App routing + EN translations (PR 1)

- [ ] Install `next-intl`
- [ ] Add `middleware.ts`
- [ ] Restructure `app/` with `[locale]` segment
- [ ] Update `next.config.mjs`
- [ ] Update `<html lang>` attribute to use locale
- [ ] Create `messages/en.json`
- [ ] Replace hardcoded strings in `Footer.tsx`
- [ ] Replace hardcoded strings in `Menu` components
- [ ] Replace hardcoded strings in `Profile` and sub-components
- [ ] Replace hardcoded strings in `Roll.tsx` and filter components
- [ ] Replace hardcoded strings in `Article` components

### French data (PR 3a)

- [ ] Add `_fr` columns to all 19 lookup tables listed in Phase 1.1
- [ ] Add `_fr` columns to article/about-us content tables (Phase 1.2)
- [ ] Fill in French translations for all lookup data
- [ ] Fill in French translations for all article and about-us content
- [ ] Add `fr` to middleware locales
- [ ] Update the 3 hardcoded event titles in `getTunneller.ts` with locale conditional

### French UI strings + language switcher (PR 3b)

- [ ] Create `messages/fr.json`
- [ ] Add language switcher to `Menu`
