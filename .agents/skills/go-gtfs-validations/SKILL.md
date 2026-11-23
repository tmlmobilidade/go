---
name: go-gtfs-validations
description: Create, implement, or change file and relationship validation rules in packages-golang/gtfs-validator, including rule naming, documentation, formatting, and tests.
---

# GTFS validations

Paths below are relative to the GO repository root. The target package is `packages-golang/gtfs-validator`.

## 1. Settle the rule

Identify the requested rule IDs and their destination under `src/rules/file-validations/<domain>/` or `src/rules/relationship-validations/<group>/`. Treat a supplied list as the complete scope: implement only those rules, even when legacy code contains more.

For each rule, establish the accepted values or relationship, grouping keys, missing/blank handling, configuration behavior, and finding rows. Read the relevant existing code, supplied legacy implementation, and GTFS specification before asking for facts that can be found there. Explicit user instructions govern the requested behavior. Surface consequential conflicts between legacy code and the documented GTFS rule rather than silently choosing one.

If any intended behavior remains unclear, use **grill-me** (the **grilling** workflow) to clarify the decisions before implementing the affected algorithm. If that skill is unavailable, ask the questions directly. Continue independent investigation while answers are pending.

**Done:** the requested rule set and each rule's behavior are clear. Implement working algorithms by default. Create `return true, nil, nil` stubs only when explicitly requested, and identify them as unimplemented in their documentation and delivery.

## 2. Read the current exemplars

Open the [shape-direction validation](../../../packages-golang/gtfs-validator/src/rules/file-validations/trips/trip_shape_id_uses_direction_id.go) for function layout, documentation, and findings. For field checks, inspect the matching examples in `src/rules/file-validations/agency/` and `src/rules/file-validations/trips/`. Use the current exemplar for formatting; derive behavior from the settled rule, not incidental behavior in a neighboring validation or stub.

Read `src/utils/fields/`, `src/utils/sql/`, and `src/utils/validators/` for applicable helpers. Read `src/types/rule.go`, `src/types/finding.go`, and `src/rules/run-validations.go` for the current configuration and execution contract.

**Done:** the implementation has a known source for its behavior, code format, and applicable utility semantics.

## 3. Implement exactly the requested rules

- Use one `<rule_id>.go` file and one exported validation method per rule. Preserve requested singular/plural prefixes exactly; convert snake_case to PascalCase with Go acronyms such as `ID` and `URL`.
- Use the domain or relationship group's checks receiver and signature: `func (<Domain>Checks) <RuleMethod>(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error)`.
- Keep each domain/group `checks.go` limited to its checks struct. Put the algorithm inside the individual validation method; repeating domain-specific code is preferred to introducing domain helpers. Reuse existing general utilities. Add a helper under `src/utils/` only when its operation is genuinely useful across domains.
- Existing receivers embedded in `src/rules/checks.go` expose their methods automatically. For a requested new domain/group, add its struct and embed it in that central registry. Verify resolution: rule IDs match method names after removing underscores, case-insensitively.
- Keep presence, value validity, uniqueness, and foreign-key checks in their respective requested rules. Handle invalid prerequisites according to the settled contract; explain skips in the rule documentation. Missing tables, columns, NULL, and blank values need deliberate handling rather than accidental query errors.
- Return findings for invalid feed data and propagate database/context errors separately. Populate `Description` with the report group's generic explanation and `Message` with useful offending values or group details. Set `Severity` from the rule config, `FileName`, `Field`, and the relevant source `Rows`. Rows remain zero-based; the report layer applies the CSV line offset.
- Apply configuration only where relevant to the rule. In option checks, preserve the distinction between nil and empty options. `all_options` bypasses the configured value list, while enum/type validity still applies. Inspect utility behavior before relying on it for forbidden or conditional presence.

**Done:** every requested algorithm is implemented or explicitly requested as a stub, the rule inventory stays within scope, and each method is discoverable by its exact ID.

## 4. Explain and format the algorithm

Immediately above each validation method, write the exemplar's block comment with `# Attributes` and `# Description`. Include the file, field where applicable, GTFS presence, and type, plus a reference link. Explain the actual acceptance rule and meaningful conditions, configured options, or skipped prerequisites. Reuse relevant legacy documentation, adapting it to the split rule and current algorithm so it describes what this method actually checks.

Match the exemplar inside the function:

- Blank line after the opening brace.
- A bare `//` followed by `// 1. <what this stage does>` before the first stage.
- Sequential numbered comments for later meaningful stages, separated by blank lines. A simple utility wrapper can have one stage.
- Blank lines between logical stages, error handling, and the final result. Use a final “Return the findings” stage when findings are collected.

Keep `checks.go` struct-only during formatting changes too.

**Done:** comments explain the rule and its stages, and layout matches the live exemplar.

## 5. Verify and deliver

For implemented algorithms, add focused tests covering accepted and rejected data and the relevant boundaries: absence, malformed values, grouping, configuration, and source-row reporting. Reuse the SQLite setup and graph-execution patterns in [trip rule tests](../../../packages-golang/gtfs-validator/tests/trip_rules_test.go) and `tests/sql_test.go`. Include a check that the requested rule ID executes through `NewValidationGraph`; an unresolved rule can otherwise become a warning instead of running the algorithm.

Run the relevant tests from the validator package, format changed Go files with `gofmt`, and run `git diff --check`. For comments/spacing-only work, verify formatting and that executable code is unchanged; algorithm tests need not be added for that edit. Report unrelated existing failures separately from failures caused by the change.

**Done:** the requested rules and findings are verified, no extra validation IDs were introduced, and the final response states the implemented behavior, checks performed, and any explicit stubs or unresolved blockers.
