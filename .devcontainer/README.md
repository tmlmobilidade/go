# GO Dev Container

This dev container gives the GO monorepo a consistent Node.js, npm, and
Turborepo workspace across Cursor and VS Code.

## Usage

1. Install Docker Desktop or another OCI-compatible container runtime.
2. Open the repository in Cursor or VS Code.
3. Run **Dev Containers: Reopen in Container**.
4. Wait for `npm install` to finish.
5. Run the usual monorepo commands:

```bash
npm run build:packages
npm run dev:auth
npm run dev:{module}
```

## Environment files

The container sets `ENVIRONMENT=dev` and `NODE_ENV=development`. Module secret
files still live outside version control under each module's `environments/`
tree. Copy the matching `.env.example` file or use the repo's `env-sync` tooling
before starting a module that requires secrets.

## Persisted caches

The container keeps npm, root `node_modules`, and Turborepo caches in Docker
volumes so dependency installation and rebuilds stay fast between container
recreates.
