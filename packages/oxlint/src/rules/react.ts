import { defineConfig } from "oxlint";

/**
 * React / Next.js Oxlint config for browser JSX/TSX.
 *
 * Enables `react` and `nextjs` plugins, sets a browser env, and applies
 * JSX stylistic overrides (closing tags, curly presence, prop sort) plus
 * hooks / key / self-closing rules. Formatting-only JSX concerns belong
 * in oxfmt; these stay as lint errors.
 *
 * @see https://oxc.rs/docs/guide/usage/linter/rules.html
 */
export const reactConfig = defineConfig({
	categories: {
		correctness: "error",
	},

	// Environment
	env: {
		browser: true,
	},

	// JSX/TSX Styling Rules
	// Scoped to jsx/tsx files, same as the original file filter.
	// Formatting-only JSX rules (quotes, bracket/tag location, equals
	// spacing, one-expression-per-line) belong in oxfmt. These stay
	// here because a formatter can't express them as lint errors.
	overrides: [
		{
			files: ["**/*.tsx", "**/*.jsx"],
			rules: {
				// JSX Best practices
				"@stylistic/jsx-closing-bracket-location": ["error", "tag-aligned"],
				"@stylistic/jsx-closing-tag-location": "error",
				"@stylistic/jsx-curly-brace-presence": [
					"error",
					{
						children: "never",
						props: "never",
					},
				],
				"@stylistic/jsx-equals-spacing": ["error", "never"],
				"@stylistic/jsx-one-expression-per-line": "off",
				"@stylistic/jsx-quotes": ["error", "prefer-double"],
				"@stylistic/jsx-self-closing-comp": [
					"error",
					{
						component: true,
						html: true,
					},
				],

				// JSX Props organization
				"@stylistic/jsx-sort-props": [
					"error",
					{
						ignoreCase: true,
						multiline: "last",
						reservedFirst: ["key", "ref"],
						shorthandLast: true,
					},
				],
				"perfectionist/sort-jsx-props": "off",
			},
		},
	],

	// Do not contribute default plugins into the extends union.
	plugins: [],

	// Next.js + React Rules
	rules: {
		// Next.js Plugin
		"nextjs/no-html-link-for-pages": "error",
		"nextjs/no-img-element": "error",

		// React Plugin
		"react/exhaustive-deps": "warn",
		"react/jsx-key": "error",
		"react/no-children-prop": "error",
		"react/no-unescaped-entities": "error",
		"react/rules-of-hooks": "error",
		"react/self-closing-comp": "error",
	},
});
