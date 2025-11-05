## @tmlmobilidade/tsconfig

This package contains the shared TypeScript configuration for the Transportes Metropolitanos de Lisboa organization.
Centralize and standardize TypeScript settings across all projects, ensuring consistency, maintainability, and ease of setup.

### Benefits
- Consistent TypeScript setup across projects
- Easier updates and maintenance
- Fewer configuration errors


### Instalation
```
npm install -D @tmlmobilidade/tsconfig
```

### Options
Several options are provided depending on the project type:
- nodejs.json — For server-side NodeJS projects;
- nextjs.json — For client-side NextJS projects;
- lib.json — For projects intended to be packages imported into other projects;
- base.json — The shared config for all types (not recommended).


### Usage
In your tsconfig.json:
```
{
  "extends": "@tmlmobilidade/tsconfig/{your-project-type}.json",
  "compilerOptions": {
    // Add any project-specific overrides here
  }
}
```