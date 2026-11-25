# Runtime updates

## Automated updates

[`check-production-node.yml`](../.github/workflows/check-production-node.yml) runs every Monday at 09:00 UTC and can be run manually. It checks:

- the newest Node.js version made available by N0C within the project's configured Node.js major version; and
- the npm version bundled with that exact Node.js version in the [official Node.js distribution index](https://nodejs.org/dist/index.json).

When an update is available, the workflow creates or updates the `chore/update-node-and-npm` pull request. It updates `.nvmrc` and the `engines` fields in `package.json`, regenerates `package-lock.json`, and validates it with `npm ci`.

Review and merge the generated pull request as usual.

## Node major-version updates

The workflow identifies newer Node.js major versions made available by N0C, but does not update them automatically. It creates a GitHub issue linking to this procedure because a major upgrade requires hosting and dependency changes.

1. Go to the **Languages** section in N0C and select **Node.js**.
2. Stop the application and change its Node.js version. N0C creates a new environment at `nodevenv/${folder-where-your-application-lives}/${new-node-version}/bin/activate`.
3. Start the application.
4. Update the Node.js version in `.nvmrc` and `package.json`.
5. Update the Node major version used to activate the production environment in [the deployment workflow](https://github.com/ByAnthony/new-zealand-tunnellers/blob/main/.github/workflows/nztunnellers.yml#L215).
6. Update `@types/node` to a compatible version.
7. Run `npm install` to update `package-lock.json`, then raise a pull request.
8. Merge the pull request and redeploy.
