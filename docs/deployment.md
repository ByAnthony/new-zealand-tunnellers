# Deployment

This document explains how this project is deployed to [N0C](https://kb.n0c.com/en/what-is-n0c/) and how the current GitHub Actions rollout works.

## Prerequisites

### Next.js custom server

To be able to use your Next.js app with N0C, you will have to use a [custom server](https://github.com/vercel/next.js/tree/canary/examples/custom-server):

1. Install `cross-env` and `nodemon` packages:

```zsh
npm install cross-env nodemon
```

1. Copy and add the following files to the root of your application:
   1. [`server.ts`](https://github.com/ByAnthony/newzealandtunnellers/blob/04cb75b6812fc5391fb79412c718d8e0c8e1c6ba/server.ts);
   2. [`nodemon.json`](https://github.com/ByAnthony/newzealandtunnellers/blob/04cb75b6812fc5391fb79412c718d8e0c8e1c6ba/nodemon.json);
   3. [`tsconfig.server.json`](https://github.com/ByAnthony/newzealandtunnellers/blob/04cb75b6812fc5391fb79412c718d8e0c8e1c6ba/tsconfig.server.json).

2. Modify your scripts in the `package.json`:

```json
"scripts": {
    "dev": "nodemon",
    "build": "next build && tsc --project tsconfig.server.json",
    "start": "cross-env NODE_ENV=production node dist/server.js",
    ...
}
```

Server entry point is `server.ts` in development and `dist/server.js` in production. The dist directory should be added to `.gitignore`.

#### Custom Loader For Images

1. Create a [`imageLoader.ts`](https://github.com/ByAnthony/newzealandtunnellers/blob/04cb75b6812fc5391fb79412c718d8e0c8e1c6ba/utils/imageLoader.ts) file to optimize your images instead of using the Next.js built-in Image Optimization API;
2. Add the custom loader to your `next.config.mjs` file:

   ```js
   const nextConfig = {
       ...
       basePath: "",
       assetPrefix: "",
       images: {
           loader: "custom",
           loaderFile: "./utils/imageLoader.ts",
       },
   };
   ```

#### Image caching

See [Caching](./caching.md) for image cache headers, filename changes when
replacing images, offline book refreshes, and the effects of a deployment.

### N0C setup

1. Go to **Node.js** in the Languages Section of your N0C;
2. Click **Create**:
   1. Choose your **Node.js version**;
   2. Choose your **Application mode** (development or production);
   3. **App directory**: type a name for the folder where your Next.js app will live;
   4. **App url**: this will already be preselected to your domain name by default;
   5. **Boot file**: `dist/server.js`.
3. Click **Create**.

This setup creates a folder according to the application root your have mentioned on your server. A few sub folders should be generated like `/tmp/` and `/dist/` folders.

## GitHub Actions

The repository uses the deployment workflow at `.github/workflows/nztunnellers.yml` and a scheduled runtime check at `.github/workflows/check-production-node.yml`.

On `push` to `main`, the workflow currently runs three jobs:

1. `checks`
2. `build-production`
3. `deployment`

On pull requests, the deployment job is skipped. A manually dispatched run from `main` and deploys, which is useful when a database-only change needs a new build.

### SSH key

Setup an SSH key (without passphrase) to being able to access your server. You can add it in **SSH Keys** in the Files section of your N0C.

### Database

This application needs database access at build time. The current workflow exports the production MariaDB database over SSH once, copies the dump into the GitHub runner, and imports it into the MariaDB service used by the combined build and E2E job.

That logic lives in the composite action at [`.github/actions/setup-database/action.yml`](../.github/actions/setup-database/action.yml).

### Environment variables

Production requires a `.env` file because the application reads its database configuration from runtime environment variables:

- `MYSQL_HOST`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_PORT`
- `NEW_RELIC_LICENSE_KEY`
- `NEW_RELIC_APP_NAME`

The GitHub Actions workflow generates `.env` from repository secrets inside the jobs that need it, but `.env` must not be uploaded in the deployment artifact. The CI build/E2E job creates a single `.env` with database settings and blank New Relic values; the deployment job creates the production `.env` with New Relic secrets before syncing files to the server.

New Relic server-side monitoring is disabled unless `NEW_RELIC_LICENSE_KEY` and `NEW_RELIC_APP_NAME` are present. Add both values as GitHub repository secrets before deploying server-side monitoring.

### Build, Test And Deploy

The workflow is split into three jobs:

1. `checks`
   Runs `npm ci`, linting, Prettier, and unit tests.
2. `build-production`
   Imports a copy of the production database into the CI MariaDB service, creates the CI `.env`, builds the app, runs Playwright against that build, and uploads a single deployment artifact without secrets.
3. `deployment`
   Downloads the artifact, creates the production `.env`, and syncs everything to the N0C server.

This means CI calls the live database once, builds once, validates that build with E2E tests, and only uploads the artifact after the E2E suite has passed.

### Deployment Artifact

The deployment artifact must include all runtime files that the server needs:

- `.next`
- `dist`
- `public`
- `package.json`
- `package-lock.json`
- `newrelic.cjs`
- `next.config.mjs`
- `tsconfig.server.json`
- `server.ts`
- `i18n/request.ts`
- `i18n/routing.ts`
- `utils/imageLoader.ts`
- `messages`
- `contents`

Because `.next` is a hidden directory, `actions/upload-artifact` must be configured with `include-hidden-files: true`. Without that option, the production build output is skipped and the application cannot start.

The `contents` directory is required at runtime because book pages read Markdown files from disk. The contents page also reads cookies, so a successful build does not guarantee that its Markdown will be available when a reader opens it. CI E2E tests run in the full checkout before artifact upload and therefore do not detect missing files in the deployment artifact.

### Sync Files

The deployment job syncs the artifact to the server with `rsync` over SSH:

```bash
rsync -az --delete \
  --exclude ".next/cache/**" \
  --exclude "tmp/" \
  -e "ssh -p 5022" \
  ./ deploy:~/${folder-where-your-application-lives}/
```

Notes:

- `--delete` removes stale files from previous deployments;
- `.next/cache` is excluded because it is build cache and not required at runtime;
- `tmp/` is excluded because it is managed by N0C and is used for restarts.

### Caches

The [CI workflow](../.github/workflows/nztunnellers.yml) caches npm downloads via
`setup-node`, `.next/cache` via `actions/cache`.
The Next.js cache key uses the lockfile and JavaScript/TypeScript source hashes,
with a lockfile-based restore prefix. Restoring this cache can also restore
persistent Next.js data; this is another reason to version the tunnellers key
described in [Caching](./caching.md).

Deployment sync excludes `.next/cache/**`. This does not clear an existing server
cache, and a restart is not a universal cache reset. Browser HTTP caches, saved
offline books, and localStorage live on readers' devices and are untouched by
server deployments.

### Restart server automatically

N0C uses `nodevenv` to set the desired Node.js version for your web application. Therefore, when connecting to your server, run:

```bash
source nodevenv/${folder-where-your-application-lives}/${node-version}/bin/activate
```

**Note**: the version directory is the Node major version. For example, use `24` for a `24.x.x` release.

Then:

```bash
cd folder-where-your-application-lives && HUSKY=0 npm ci
```

Finally, create a `restart.txt` which needs to be added to the `/tmp/` folder:

```bash
mkdir -p ~/${folder-where-your-application-lives}/tmp
touch ~/${folder-where-your-application-lives}/tmp/restart.txt
```

This restarts the application after a new rollout.

## Updating Node.js

### Production Node version check

[`check-production-node.yml`](../.github/workflows/check-production-node.yml) runs every Monday at 09:00 UTC and can be run manually. It lists the Node versions exposed by N0C for the production app and fails unless the exact version in `.nvmrc` is available.

Enable failed GitHub Actions notifications at [GitHub notification settings](https://github.com/settings/notifications) to be alerted when N0C upgrades or removes the configured Node version.

### Update Checklist

- [ ] Go to the "Languages" section in N0C and click on **Node.js**;
- [ ] Click "Stop" button and change the node version to the latest in your already created web application. Under the hood N0C will create a new folder with the new node version: `nodevenv/${folder-where-your-application-lives}/${new-node-version}/bin/activate`;
- [ ] Click "Start" button for the application;
- [ ] Manually trigger [`check-production-node.yml`](../.github/workflows/check-production-node.yml) to identify the new version used on the server;
- [ ] Raise a PR to update to the new version, including:
  - [ ] Update the `${new-node-version}` in the [GitHub Actions workflow](https://github.com/ByAnthony/new-zealand-tunnellers/blob/7f5556524cc5f7731ed1554f7b1814a5e8580dc6/.github/workflows/nztunnellers.yml#L130);
  - [ ] Updating `@types/node` to the new compatible version.
- [ ] Redeploy.
