# @tmlmobilidade/go-types-gtfs-validator

Types and helpers shared by the GTFS validator, the Core API, the Core frontend and the validator worker.

## Validation rules

The Go validator is the source of truth for validation rules. Its rule structs and catalogue generate `src/rules/rules.generated.ts`, which is committed. Do not edit that file by hand.

```sh
npm run repo:validator-rules        # regenerate (requires Go)
npm run repo:validator-rules:check  # fail if the committed file is missing or stale
```

Package and Docker builds use the committed file and do not need Go. CI runs the check and the Go rule tests on pull requests and on pushes to `prd`.

### Exports

| Export | What it is |
| --- | --- |
| `ruleSeverities`, `RuleSeverity` | Every severity the validator accepts. |
| `ruleGroups`, `RuleGroup` | The file sections of the rules, such as `agency` or `stops`. |
| `ruleConfigKeys`, `RuleConfigKey<G>` | The keys stored in each section. |
| `ruleIds`, `RuleId` | The rule ids the validator emits, one per catalogue entry. |
| `RuleOutputId` | Every id that can appear in a validator message. |
| `ValidationRules`, `AgencyRules`, `RuleConfig`, ... | The configuration after Go fills every omitted setting. |
| `ValidationRulesInput`, `AgencyRulesInput`, `RuleConfigInput`, ... | The configuration as saved and accepted by Go, where keys may be omitted. |
| `ruleCatalogue`, `RuleCatalogueEntry` | Editor metadata: editable rules and fixed technical notices. |
| `getRuleSeverity`, `setRuleSeverity` | Read and change one catalogue entry's severity in saved rules. |
| `getSavedRuleSeverity` | The stored severity, or `undefined` when the rule was never configured. |
| `normalizeValidationRules` | Parse and check saved rules against the editor's policy. |
| `isRuleSeverity`, `parseRuleSeverity` | Runtime severity checks. |

The generated types are compile-time only. `normalizeValidationRules` is the runtime check, and it is intentionally stricter than the Go decoder: a rule that is present must have a valid severity.

A stored config key can differ from the emitted rule id. For example, `frequencies.trip_id` emits `frequencies_trip_id_references_trips_table`. Catalogue entries carry both `config_key` and `id`, and `setRuleSeverity` always writes under `config_key`.

### Removed exports

These exports from earlier releases were removed. There are no compatibility wrappers.

| Removed | Replacement |
| --- | --- |
| `gtfsValidationRulesConfig` | No replacement. Its defaults were not the validator's. Missing rules default to `ignore` in Go. |
| `GtfsValidationRuleSchema`, `GtfsValidationRule` | `ValidationRulesInput` for types, `normalizeValidationRules` for runtime checks. |
| `GtfsValidationRuleCompareSchema` | `RuleCompare` and `RuleCompareInput`. |
