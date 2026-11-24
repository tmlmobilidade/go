# @tmlmobilidade/go-types-gtfs-validator

Shared GTFS rule configuration and report schemas for the Go validator and GO apps.

## Rule configuration

`GtfsValidatorRulesSchema` parses an array of `GtfsValidationRule` entries. Each
rule has a known `rule_id`, optional `depends_on` IDs that default to an empty list,
and a severity of `ignore`, `info`, `warning`, `error`, or `forbidden`. The validator
uses the configured dependencies to order the rules.

An optional `modifiers` object contains one of these shapes.

```json
{ "type": "options", "values": ["Example Transit"] }
```

```json
{ "type": "compare", "values": [{ "key": "01", "value": "Example Transit" }] }
```

Omit the modifier to use the rule's defaults. An empty `values` array is an explicit
setting.

## Reports

`GtfsValidationOutputSummarySchema` parses `results` and `totals`. Each rule has
one result with its description, severity, diagnostic messages, and total affected
rows. A message contains its text and sampled CSV line numbers. Totals count
distinct errors, warnings, and informational findings before sampling. Findings
from rules configured as `forbidden` are reported as errors.

## Generated rule IDs

The generation script reads the rule filenames in
`packages-golang/gtfs-validator/src/rules` and writes `src/rules/rule-ids.ts`.
It exports the sorted list, a case-normalizing schema, and the inferred rule ID type.

```sh
npm run repo:validator-rules
npm run repo:validator-rules -- --check
```
