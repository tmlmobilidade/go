### @tmlmobilidade/bump-version 🧼

Bump version is a small util to update the package.json version string using the current timestamp.

#### Usage:

```
npx @tmlmobilidade/repo-version --output=<path-to-package.json | console> --format=<default | code> --prefix=<your-prefix>
```

##### `--format`
- "string" - Output as a formatted string (e.g. `20250101.1026.12`)
- "code" - Output as number (e.g. `20250101102612`)

##### `--prefix`
- an optional value to prepend to the version string (only in default format)

##### `--suffix`
- an optional value to append to the version string (only in default format)

##### `--output`
- "<path-to-package.json>" - Modify the package.json.
- "console" - Output to the console. This will hide any other logs.

:)