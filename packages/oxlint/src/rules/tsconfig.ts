import { defineConfig } from "oxlint";

/**
 * Rules applied to `tsconfig.json` for consistent formatting and key order.
 *
 * Currently inert: Oxlint has no custom file-parser API, so JSON cannot
 * be linted yet. Kept ready for when that lands.
 *
 * Sets `plugins: []` so this fragment does not pull default plugins into
 * the extends union when composed by {@link lintConfig}.
 *
 * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/sort-keys.html
 */
export const tsconfigConfig = defineConfig({
	overrides: [
		{
			files: ["**/tsconfig.json"],
			rules: {
				"@stylistic/comma-dangle": ["error", "never"],
				"jsonc/auto": "error",
				"jsonc/sort-keys": [
					"error",
					{
						order: [
							"extends",
							"compilerOptions",
							"include",
							"exclude",
						],
						pathPattern: "^$",
					},
					{
						order: { type: "asc" },
						pathPattern: ".*",
					},
				],
			},
		},
	],

	plugins: [],
});
