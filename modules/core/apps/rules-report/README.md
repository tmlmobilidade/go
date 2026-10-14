# Agency validation rules report

## API download

With the Core API running locally, make an authenticated `GET` request to:

```text
http://localhost:52000/agencies/validation-rules-report
```

The endpoint requires the existing `agencies.read` permission and returns the current report as an HTML attachment named `agency-validation-rules.html`. Open the URL in a browser with an active GO session to download it. Behind the deployed gateway, the path is `/core/api/agencies/validation-rules-report`.

The API generates the report on demand; the worker does not need to be running. Both use the same renderer in the Core utils package. No agencies returns the standard API 404 response.

After pulling these changes, build the shared package before starting the API:

```sh
npx turbo run build --filter=@tmlmobilidade/go-core-pckg-utils
npm run dev:core:ui
```

## Local worker

One-shot, read-only Core worker. Exports a standalone HTML table with the current GTFS rule catalogue as rows and every agency (`_id` and `short_name`) as columns. Reads `core.agencies.plans.validation_rules`, saves the file locally, then closes its MongoDB/SSH connections.

From the repository root:

```sh
npm run dev:core:agency-rules-report
open .output/agency-validation-rules.html
```

The command builds the worker and its dependencies and uses the existing **staging** environment loader. It requires the same database/SSH access as the Core API. To choose the output file:

```sh
npm run dev:core:agency-rules-report -- --output "$HOME/Downloads/agency-validation-rules.html"
```

Relative output paths resolve against the directory where npm was invoked. The default is `.output/agency-validation-rules.html`; rerunning replaces that snapshot. To use another environment, build the workspace and run its `start` script under the appropriate environment loader.

Open the HTML in any browser; no server or internet connection is needed. Search by rule ID/file, or filter rules with different severities, explicitly ignored rules, and missing/invalid settings. Headers stay visible when scrolling.

- `Erro`, `Aviso`, `Ignorado`, `Proibido`: saved `error`, `warning`, `ignore`, `forbidden` values. `_file` entries store the severity directly.
- `Não configurado`: the rule/section is absent, including agencies with no saved rules. This is distinct from explicit `ignore`; the validator requires complete configuration.
- `Inválido`: malformed JSON, an invalid section/rule object, or a missing/invalid severity in an existing rule. These remain visible so other agencies can still be compared.
- `Fixo`: technical notices with severities supplied by the catalogue, including notices with multiple possible severities.

Only current catalogue entries are shown. Differences compare saved severity/status, not rule options or dependency execution. The report does not edit agency settings.

Validation without database access:

```sh
npm run test --workspace=@tmlmobilidade/go-core-agency-rules-report
npm run lint --workspace=@tmlmobilidade/go-core-agency-rules-report
```
