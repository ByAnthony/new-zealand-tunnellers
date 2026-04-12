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

The repository uses a single workflow at [`.github/workflows/nztunnellers.yml`](../.github/workflows/nztunnellers.yml).

On `push` to `main`, the workflow currently runs three stages:

1. `checks-and-run-tests`
2. `run-e2e-tests`
3. `deployment`

On pull requests, the deployment job is skipped.

### SSH key

Setup an SSH key (without passphrase) to being able to access your server. You can add it in **SSH Keys** in the Files section of your N0C.

### Database

This application needs database access at build time. The current workflow exports the production MariaDB database over SSH, copies the dump into the GitHub runner, and imports it into the MariaDB service used during build and E2E execution.

That logic lives in the composite action at [`.github/actions/setup-and-build/action.yml`](../.github/actions/setup-and-build/action.yml).

### Environment variables

If you need a `.env` file, add your own variables by simply running this script:

```yml
- name: Create .env file
    run: |
        echo "VARIABLE_NAME=my_variable" >> .env
        ...
```

This file is then used by the `build` step.

### Build and sync files

The current deployment job:

- installs dependencies
- builds the app with `npm run build`
- uploads the build output with [SamKirkland/FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- restarts the Node.js app on N0C

The FTP sync currently uploads the built `.next` output file by file. This works, but it is the slowest part of the rollout because Next.js generates many small files under `.next/server/app/**` and `.next/static/**`. Even relatively small content or UI changes can therefore trigger a long sync.

The current excludes are defined directly in the workflow and should be kept in sync with the runtime needs of the custom server.

### Restart server automatically

N0C uses `nodevenv` to set the desired Node.js version for your web application. Therefore, when connecting to your server, run:

```bash
source nodevenv/${folder-where-your-application-lives}/${node-version}/bin/activate
```

**Note**: the Node version should just be `22` if you are using a `22.x.x` release.

Then:

```bash
cd folder-where-your-application-lives && npm ci
```

Finally, create a `restart.txt` which needs to be added to the `/tmp/` folder:

```bash
touch ~/${folder-where-your-application-lives}/tmp/restart.txt
```

This restarts the application after a new rollout.

### Current deployment limitations

- the deployment job rebuilds the app instead of reusing a build artifact from the test jobs
- the FTP sync step is slow for `.next` output because it transfers many small files
- the server restart step currently runs `npm ci` on the host before touching `tmp/restart.txt`

If deploy time becomes a recurring issue, the first thing to review is the FTP sync strategy.

### Updating Node.js

- In **Node.js**, change the node version to the latest in your already created web application:
  - Under the hood N0C will create a new folder with the new node version: `nodevenv/${folder-where-your-application-lives}/${new-node-version}/bin/activate`.
- Raise a PR to update to the new version.
- Update the `${new-node-version}` in the [GitHub Actions workflow](https://github.com/ByAnthony/new-zealand-tunnellers/blob/7f5556524cc5f7731ed1554f7b1814a5e8580dc6/.github/workflows/nztunnellers.yml#L130);
- Redeploy.
