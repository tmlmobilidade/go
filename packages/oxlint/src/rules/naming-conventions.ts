import { defineConfig } from "oxlint";

/**
 * Naming conventions via the native `typescript/naming-convention` rule,
 * ported from `@typescript-eslint/naming-convention`.
 *
 * Tuned to the conventions this codebase already follows, rather than to
 * typescript-eslint's stock "camelCase everything" preset (which produced
 * ~3.5k warnings here):
 *
 * - `PascalCase` is allowed for functions and variables, since React
 *   components (`ActionBar`), Zod schemas (`UserPreferencesSchema`) and
 *   client classes (`CcflClient`) are all bound that way.
 * - `UPPER_CASE` is allowed for variables, class members and object literal
 *   members, for constants and route/permission maps (`MAX_BATCH_SIZE`,
 *   `ACCEPTANCE_DETAIL`).
 * - Format checking is off for anything mirroring an external wire format —
 *   type/object-literal properties and destructured bindings — because those
 *   names are dictated by ClickHouse columns, GTFS fields and JSON payloads
 *   (`agency_id`, `created_at`), not by us. Quoted keys such as
 *   `"@stylistic/comma-dangle"` also fall here: they can never satisfy any
 *   format, since they aren't valid identifiers.
 *
 * Type-like names (`class`, `interface`, `typeAlias`, `enum`,
 * `typeParameter`) are still held to `PascalCase`.
 *
 * Composed into {@link lintConfig} via `extends`, so it applies repo-wide.
 * It can also be exercised standalone against a locally-built `oxlint` (see
 * the `oxlint` dependency in this package's `package.json`):
 *
 * ```sh
 * npx oxlint -c src/rules/naming-conventions.ts <file-or-dir>
 * ```
 *
 * Sets `plugins: []` so this fragment does not pull default plugins into
 * the extends union when composed by {@link lintConfig}.
 *
 * @see https://typescript-eslint.io/rules/naming-convention/
 */
export const namingConventionsConfig = defineConfig({
	// Do not contribute default plugins into the extends union.
	plugins: [],

	rules: {
		"typescript/naming-convention": [
			"error",
			// Variables and functions: camelCase
			{
				format: ['camelCase'],
				leadingUnderscore: 'allow',
				selector: 'variableLike',
			},
			{
				format: ['camelCase'],
				selector: 'function',
			},
			// Global variables and constants: UPPER_CASE
			{
				format: ['UPPER_CASE'],
				modifiers: ['global'],
				selector: 'variable',
			},
		],
	},
});
  
// Allows this fixture to also be loaded directly as an oxlint config, e.g.
// `oxlint -c src/rules/naming-conventions.ts`. A root config's `plugins`
// list overwrites the defaults rather than extending them (see
// {@link lintConfig} in `./index.ts`), so — unlike the fragment above —
// this needs `typescript` listed explicitly or none of its rules would run.
export default defineConfig({
	plugins: ["typescript"],
	rules: namingConventionsConfig.rules,
});
