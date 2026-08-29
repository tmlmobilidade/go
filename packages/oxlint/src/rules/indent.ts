import { defineConfig } from "oxlint";

/**
 * Enforces consistent indentation using tabs.
 *
 * Applies tab indent globally via `@stylistic`, and JSX indent / indent-props
 * for `*.tsx` / `*.jsx`. Candidate to move to oxfmt later.
 *
 * Sets `plugins: []` so this fragment does not pull default plugins into
 * the extends union when composed by {@link lintConfig}.
 *
 * @see https://eslint.style/rules/indent
 */
export const indentConfig = defineConfig({
	overrides: [
		{
			files: ["**/*.tsx", "**/*.jsx"],
			rules: {
				"@stylistic/jsx-indent": [
					"error",
					"tab",
					{
						checkAttributes: true,
						indentLogicalExpressions: true,
					},
				],
				"@stylistic/jsx-indent-props": ["error", "tab"],
			},
		},
	],

	plugins: [],

	rules: {
		"@stylistic/indent": ["error", "tab"],
		"@stylistic/no-mixed-spaces-and-tabs": "error",
		"@stylistic/no-tabs": "off",
		"@stylistic/operator-linebreak": "off",
		indent: "off",
	},
});
