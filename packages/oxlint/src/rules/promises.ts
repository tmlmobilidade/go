import { defineConfig } from "oxlint";

/**
 * Type-aware TypeScript promise and exhaustiveness rules.
 *
 * Scoped to `**\*.{ts,tsx}`. These rules are configured here but inert
 * until the root config sets `options.typeAware: true` and
 * `oxlint-tsgolint` is installed.
 *
 * Sets `plugins: []` so this fragment does not pull default plugins into
 * the extends union when composed by {@link commonConfig}.
 *
 * @see https://oxc.rs/docs/guide/usage/linter/rules.html
 */
export const promisesConfig = defineConfig({
	// Do not contribute default plugins into the extends union.
	overrides: [
		{
			files: ["**/*.ts", "**/*.tsx"],
			rules: {
				"typescript/await-thenable": "error",
				"typescript/no-floating-promises": "off",
				"typescript/no-misused-promises": [
					"error",
					{
						checksVoidReturn: {
							arguments: false,
							attributes: false,
							properties: false,
						},
					},
				],
				"typescript/switch-exhaustiveness-check": "error",
			},
		},
	],

	plugins: [],
});
