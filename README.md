# SAE (Sistema de Apoio à Exploração)

## Project structure

All of the SAE applications are Monorepos, normally consisting of a frontend and a backend application.

Here's what a typical SAE application folder structure looks like:

```bash
.
├── _deploy/
│   ├── secrets/
│   │   ├── .env
|   |   └── private-key.pem
│   ├── compose.yaml
│   ├── nginx
│   └── .gitignore
├── _dev/
│   └── ... (similar to _deploy)
├── apps/
│   ├── frontend
│   ├── api
│   └── ...
├── turbo.json
├── package.json
└── package-lock.json
```

## Application URLs

|App Name   | Development / Frontend | Development / API | Production / Frontend                         | Production / API                                  |
|-----------|------------------------|-------------------|-----------------------------------------------|---------------------------------------------------|
|auth       | localhost:51000        | localhost:52000   | https://auth.sae.carrismetropolitana.pt       | https://auth.sae.carrismetropolitana.pt/api       |
|alerts     | localhost:51001        | localhost:52001   | https://alerts.sae.carrismetropolitana.pt     | https://alerts.sae.carrismetropolitana.pt/api     |
|controller | localhost:51002        | localhost:52002   | https://controller.sae.carrismetropolitana.pt | https://controller.sae.carrismetropolitana.pt/api |
|stops      | localhost:51003        | localhost:52003   | https://stops.sae.carrismetropolitana.pt      | https://stops.sae.carrismetropolitana.pt/api      |
|plans      | localhost:51004        | localhost:52004   | https://plans.sae.carrismetropolitana.pt      | https://plans.sae.carrismetropolitana.pt/api      |
|locations  | localhost:51005        | localhost:52005   | N/A                                           | https://locations.sae.carrismetropolitana.pt      |
|performance      | localhost:51006        | localhost:52006   | https://performance.sae.carrismetropolitana.pt      | https://performance.sae.carrismetropolitana.pt/api      |

_* In production the API is redirected through **NGINX** and in local development we use **next.config.ts**_

## Authentication Module

The authentication module operates independently, serving as a comprehensive solution for authentication, authorization, and user management. All other *SAE* applications rely on this module for these functionalities.

To integrate with the authentication module, ensure your application has the environment variable `NEXT_PUBLIC_AUTH_URL` set to the URL of the authentication app.