import { defineConfig } from "oxlint";

/**
 * Enforces consistent naming conventions across TypeScript files.
 *
 * Uses `@typescript-eslint/naming-convention` via the JS plugin (not yet
 * native in Oxlint / tsgolint). Options that need a type checker (e.g.
 * `types`) are unsupported under Oxlint's JS plugin API.
 *
 * Sets `plugins: []` so this fragment does not pull default plugins into
 * the extends union when composed by {@link lintConfig}.
 *
 * @see https://typescript-eslint.io/rules/naming-convention
 */
export const namingConventionsConfig = defineConfig({
	plugins: [],

	overrides: [
		{
			files: ["**/*.{ts,tsx}"],
			rules: {
				"@typescript-eslint/naming-convention": [
					"error",
					// Variables and functions: camelCase
					{
						format: ["camelCase"],
						leadingUnderscore: "allow",
						selector: "variableLike",
					},
					{
						format: ["camelCase"],
						selector: "function",
					},
					// Global variables and constants: UPPER_CASE
					{
						format: ["UPPER_CASE"],
						modifiers: ["global"],
						selector: "variable",
					},
					// Constants: SCREAMING_SNAKE_CASE
					{
						format: ["UPPER_CASE", "camelCase", "PascalCase"], // Allow both for flexibility
						modifiers: ["const", "global"],
						selector: "variable",
					},
					// Types and interfaces: PascalCase
					{
						format: ["PascalCase"],
						selector: "typeLike",
					},
					// Class members: camelCase
					{
						format: ["camelCase"],
						selector: "classMethod",
					},
					{
						format: ["camelCase"],
						leadingUnderscore: "allow",
						selector: "classProperty",
					},
					{
						format: ["PascalCase", "camelCase"],
						modifiers: ["public"],
						selector: "classProperty",
					},
					// Enum members: PascalCase or UPPER_CASE
					{
						format: ["PascalCase", "UPPER_CASE"],
						selector: "enumMember",
					},
				],
			},
		},

		{
			files: ["**/*.tsx"],
			rules: {
				"@typescript-eslint/naming-convention": [
					"error",
					// Components: PascalCase
					{
						filter: {
							match: true,
							regex: "^[A-Z]",
						},
						format: ["PascalCase"],
						leadingUnderscore: "allow",
						selector: "function",
					},
					// Non-component functions (including hooks): camelCase
					{
						filter: {
							match: false,
							regex: "^[A-Z]",
						},
						format: ["camelCase"],
						leadingUnderscore: "allow",
						selector: "function",
					},
				],
			},
		},
	],
});
