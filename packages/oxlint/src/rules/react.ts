import { defineConfig } from "oxlint";

/* * */

export const reactConfig = defineConfig({
	// Re-check its contents against oxlint's native rule set and
	// oxlint's Rules reference before dropping the ESLint config
	// entirely: https://oxc.rs/docs/guide/usage/linter/rules.html

	// Categories
	categories: {
		correctness: "error",
	},

	// Environment
	env: {
		browser: true,
	},

	// JS Plugins — for rules with no native Oxlint port (alpha feature)
	jsPlugins: ["@stylistic/eslint-plugin", "eslint-plugin-perfectionist"],

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

	// Native Plugins
	plugins: ["react", "nextjs"],

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
