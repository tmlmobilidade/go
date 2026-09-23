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

### Rule dependencies

The structural DAG is declared in `modules/operation/apps/validator/validator/src/lib/rules/dependencies.json` and embedded in the Go binary. Every configurable rule has an entry. The generated catalogue exposes its direct prerequisites as `depends_on`.

Basic rules depend on the synthetic `<section>_file_present` node. This tests whether the file was imported, independently of the agency's `_file` severity. Compound rules depend on the checks whose results they need; file availability is inherited transitively:

```text
agency_file_present
  ├─ agency_id_unique ────┐
  └─ agency_name_present ┴─ agency_id_matched_with_agency_name
```

Agency settings may add `depends_on` edges using configuration keys from the same section, or that section's file-presence node. They do not remove structural prerequisites. Unknown dependencies and cycles are rejected before validation. Grouped checks declare their scope (`trip`, `pattern`, or `shape`) in the JSON contract; a row check cannot depend on a later grouped check, and dependencies between different group scopes are rejected.

The shared runner sorts the DAG once per file and evaluates it independently for each row. Warnings and errors both fail a prerequisite. Ignored, unavailable, or blocked rules are skipped, and their dependents are skipped too. Independent rules and rows continue. Group checks use only the prerequisite outcomes of their own members, preserving the original source row numbers. Missing-file errors are reported without stopping validation of other available files.

The contract also includes existing configuration keys whose checks have not yet been implemented (for example, the placeholder translations and attributions validators). A missing implementation never counts as a passed prerequisite. Technical parsing notices remain fixed and outside the configurable rule DAG.

### Removed exports

These exports from earlier releases were removed. There are no compatibility wrappers.

| Removed | Replacement |
| --- | --- |
| `gtfsValidationRulesConfig` | No replacement. Its defaults were not the validator's. Missing rules default to `ignore` in Go. |
| `GtfsValidationRuleSchema`, `GtfsValidationRule` | `ValidationRulesInput` for types, `normalizeValidationRules` for runtime checks. |
| `GtfsValidationRuleCompareSchema` | `RuleCompare` and `RuleCompareInput`. |
