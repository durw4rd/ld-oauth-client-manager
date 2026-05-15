# LaunchDarkly OAuth client manager

A small React app for creating, listing, editing, and deleting [OAuth 2.0 clients](https://launchdarkly.com/docs/api/o-auth-2-clients) on your LaunchDarkly account using the REST API (`LD-API-Version: beta`). Enter a personal or service access token with the right permissions; it is stored only in this browser (local storage). The client list follows API pagination so all registered clients are loaded.

**Live app:** [https://durw4rd.github.io/ld-oauth-client-manager/](https://durw4rd.github.io/ld-oauth-client-manager/)

## Features

- **Create** clients with a name, redirect URL, description, and optional SCIM flag
- **List** all registered clients across all pages with expandable rows showing the description
- **Edit** any client (name, redirect URL, description, SCIM flag) via the PATCH API
- **Delete** clients
- **Reload** the client list without a full page refresh

## Development

In the project directory:

- **`npm start`** — run locally at [http://localhost:3000](http://localhost:3000)
- **`npm test`** — interactive test runner
- **`npm run build`** — production build in `build/`
- **`npm run deploy`** — deploy to GitHub Pages (requires `gh-pages`; `homepage` in `package.json` matches the live URL above)
