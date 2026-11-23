# GTFS validator

Use the bundled Go validator from Node.js to validate a local GTFS ZIP or an
HTTP(S) URL.

```ts
import { validateGtfs } from '@tmlmobilidade/go-utils-gtfs-validator';

const summary = await validateGtfs({
    source: { path: './gtfs.zip' },
    rules: [
        { rule_id: 'agency_file_exists', severity: 'error' },
        { rule_id: 'agency_name_exists', severity: 'error', depends_on: ['agency_file_exists'] },
    ],
});

console.log(summary.total_errors, summary.total_warnings);
```

Provide a nonempty array of rules and include every rule referenced in
`depends_on`. Use `source: { url: 'https://example.com/gtfs.zip' }` for remote
feeds. Set `concurrency` to a positive integer to run multiple rules in parallel.
The default is `1`.

Pass `signal: AbortSignal.timeout(milliseconds)` to stop the validator after a
deadline. The promise rejects with the signal's reason after the process exits.

The promise resolves with the report even when the feed has error findings.
Findings with `forbidden` severity count toward `total_errors`. Invalid
configuration, process failures, and missing or invalid reports reject the
promise. Progress is forwarded to stderr, and the wrapper removes its temporary
rules and report files after each run.

Build from the repository root. The build requires Go and a C compiler and
bundles an executable for the build platform. The integration test uses `zip`.

```sh
npx turbo run build --filter=@tmlmobilidade/go-utils-gtfs-validator
npm run test --workspace=@tmlmobilidade/go-utils-gtfs-validator
```
