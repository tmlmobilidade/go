---
title: Create an application
---


Creating an internal application is the easiest thing in the world. There are 3 steps to follow:

## 1. Create application

We've created a cli tool to help ...

```bash
npx create-tml-app
```

You should now have a folder structure like:

```bash
.
├── _deploy/
│    └── ... (similar to _dev)
├── _dev/
│   ├── secrets/
│   │   └── .env.example
│   └── ...
├── apps/
│   ├── frontend
│   ├── api
│   └── nginx
├── turbo.json
├── package.json
└── package-lock.json
```

## 2. Change the environment variables

In your monorepo folder:
```bash
cp _dev/secrets/.env.example _dev/secrets/.env
```

## 3. Install & Run dependencies

```bash
npm install && npm run dev
```