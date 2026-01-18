# Deployment

This document is a step by step guide on how to deploy a Next.js App to [N0C](https://kb.n0c.com/en/what-is-n0c/).

## Prerequisite

### Next.js Custom Server

To being able to use your Next.js app with N0C, you will have to use a [custom server](https://github.com/vercel/next.js/tree/canary/examples/custom-server):

1. Install `cross-env` and `nodemon` packages:

```zsh
npm install cross-env nodemon
```

2. Copy and add the following files to the root of your application:
   1. [`server.ts`](https://github.com/ByAnthony/newzealandtunnellers/blob/04cb75b6812fc5391fb79412c718d8e0c8e1c6ba/server.ts);
   2. [`nodemon.json`](https://github.com/ByAnthony/newzealandtunnellers/blob/04cb75b6812fc5391fb79412c718d8e0c8e1c6ba/nodemon.json);
   3. [`tsconfig.server.json`](https://github.com/ByAnthony/newzealandtunnellers/blob/04cb75b6812fc5391fb79412c718d8e0c8e1c6ba/tsconfig.server.json).

3. Modify your scripts in the `package.json`:

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

### N0C Setup

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

The entire deployment process can easily be automatized through GitHub Actions. This depends of your needs and complexity of your web application. For an example, please refer to [my workflow](https://github.com/ByAnthony/newzealandtunnellers/blob/04cb75b6812fc5391fb79412c718d8e0c8e1c6ba/.github/workflows/nztunnellers.yml).

### SSH Key

Setup an SSH key (without passphrase) to being able to access your server. You can add it in **SSH Keys** in the Files section of your N0C.

### Database

If your web application depends on a database, you will need to access it at build time. The only way I found was to connect to my server and export the database. This is then imported into GitHub Actions and set it up with the same mysql credentials as the production database.

### Environment Variables

If you need a `.env` file, add your own variables by simply running this script:

```yml
- name: Create .env file
    run: |
        echo "VARIABLE_NAME=my_variable" >> .env
        ...
```

This file will be picked up by the `build` step.

### Build And Sync Files

You should then be able to run `npm run build`.

To sync your modified files, the `.next` and `/dist/` folders, use [SamKirkland/FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action). Don't forget to exclude files and folder which are not needed to run your application in production.

### Restart Server Automatically

N0C uses `nodevenv` to set the desired Node.js version for your web application. Therefore, when connecting to your server, run:

```bash
source nodevenv/${folder-where-your-application-lives}/${node-version}/bin/activate
```

**Note**: the Node version should just be `22` if your are using `22.9.0` for example.

Then:

```bash
cd folder-where-your-application-lives && npm ci
```

Finally, create a `restart.txt` which needs to be added to the `/tmp/` folder:

```bash
touch ~/${folder-where-your-application-lives}/tmp/restart.txt
```

This will restart your application automatically after a new rollout.

### Updating Node.js

- In **Node.js**, change the node version to the latest in your already created web application:
  - Under the hood N0C will create a new folder with the new node version: `nodevenv/${folder-where-your-application-lives}/${new-node-version}/bin/activate`.
- Raise a PR to update to the new version.
- Update the `${new-node-version}` in the [GitHub Actions workflow](https://github.com/ByAnthony/new-zealand-tunnellers/blob/7f5556524cc5f7731ed1554f7b1814a5e8580dc6/.github/workflows/nztunnellers.yml#L130);
- Redeploy.
