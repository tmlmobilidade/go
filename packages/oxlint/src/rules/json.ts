import { defineConfig } from "oxlint";

/**
 * Rules applied to JSON files for consistent formatting and structure.
 *
 * Ports the eslint-plugin-jsonc overrides (no trailing commas, sorted keys).
 * Currently inert: Oxlint has no custom file-parser API, so JSON/JSONC
 * cannot be linted yet. Kept ready for when that lands.
 *
 * Sets `plugins: []` so this fragment does not pull default plugins into
 * the extends union when composed by {@link lintConfig}.
 *
 * @see https://ota-meshi.github.io/eslint-plugin-jsonc/
 */
export const jsonConfig = defineConfig({
	plugins: [],

	overrides: [
		{
			files: ["**/*.json"],
			rules: {
				"@stylistic/comma-dangle": ["error", "never"],
				"jsonc/auto": "error",
				"jsonc/sort-keys": ["error", "asc"],
			},
		},
	],
});
