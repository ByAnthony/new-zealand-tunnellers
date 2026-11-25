<div align="center">
    <img width="80" height="80" src="./public/apple-touch-icon-114x114.png"/>
</div>
<h1 align="center">
    New Zealand Tunnellers
</h1>
<p align="center">
    <!-- https://badges.pages.dev -->
    <img src="https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white" alt="nextjs">
    <img src="https://img.shields.io/badge/MariaDB-003545?logo=mariadb&logoColor=fff&style=for-the-badge" alt="mariadb">
    <img src="https://img.shields.io/badge/Hosting_Platform-N0C-27D3F5?style=for-the-badge" alt="Web Hosting Platform N0C">
</p>

The project is dedicated to a New Zealand special military unit who fought in France during the First World War (1914-1918): the _New Zealand Tunnelling Company_. The web application tells the original story of this company and shares the men's war experience.

## Technologies

This project is built using **Next.js**, **MariaDB**, **Typescript**, **Sass** and **next-intl**. Testing is performed using **React Testing Library** and **Playwright**. Deployment is managed through **GitHub Actions**. The web hosting server is controlled by **N0C**.

### Runtime updates

Node and npm runtime versions are monitored weekly by GitHub Actions:

- **Node:** checks the newest version made available by the production web host,
  within the project’s current Node major version.
- **npm:** checks the latest version published to the npm registry.

When an update is found, the workflow creates or updates a
`chore/update-node-and-npm` pull request. It updates `.nvmrc` and
`package.json`, regenerates `package-lock.json`, and validates it with
`npm ci`.

Review and merge the generated PR as usual.

## Documentation

- [**Database**](./docs/database.md) — stores and serves structured data for the web application
- [**Testing**](./docs/testing.md) — test structure, tools, and instructions
- [**Deployment**](./docs/deployment.md) — production deployment through N0C
- [**Caching**](./docs/caching.md) — cache lifetimes, deployment behaviour, and refreshing content
- [**Dependencies**](./docs/dependencies.md) — external npm packages and their purpose
