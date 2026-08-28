import { defineConfig } from "oxlint";

/* * */

export const commonConfig = defineConfig({
	// Re-check its contents against oxlint's native rule set and
	// oxlint's Rules reference before dropping the ESLint config
	// entirely: https://oxc.rs/docs/guide/usage/linter/rules.html
	//
	// Not ported yet (no native rule / needs extra JS plugins):
	// - import/no-extraneous-dependencies
	// - @typescript-eslint/naming-convention
	// - eslint-plugin-jsonc (JSON / package.json / tsconfig)
	//
	// Type-aware rules below are configured but inert until the root
	// config sets `options.typeAware: true` and `oxlint-tsgolint` is installed.

	// Categories
	categories: {
		correctness: "error",
	},

	// Environment
	env: {
		node: true,
	},

	// Ignore patterns
	ignorePatterns: [
		"**/build/**",
		"**/dist/**",
		"**/node_modules/**",
		"**/.next/**",
		"**/public/**",
		"**/*lock.json",
	],

	// JS Plugins — for rules with no native Oxlint port (alpha feature)
	jsPlugins: ["@stylistic/eslint-plugin", "eslint-plugin-perfectionist"],

	// Overrides
	overrides: [
		// Promises / type-aware (TS only; needs options.typeAware at root)
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

		// Class member ordering
		{
			files: ["**/*.{js,ts}"],
			rules: {
				"@stylistic/lines-between-class-members": "off",
				"perfectionist/sort-classes": [
					"error",
					{
						fallbackSort: { order: "asc", type: "subgroup-order" },
						groups: [
							"index-signature",

							{ group: "static-public-readonly-property", newlinesInside: 0 },
							{ group: "static-public-property", newlinesInside: 0 },
							{ group: "static-protected-readonly-property", newlinesInside: 0 },
							{ group: "static-protected-property", newlinesInside: 0 },
							{ group: "static-private-readonly-property", newlinesInside: 0 },
							{ group: "static-private-property", newlinesInside: 0 },
							{ group: "static-property", newlinesInside: 0 },

							{ group: "abstract-public-readonly-property", newlinesInside: 0 },
							{ group: "abstract-public-property", newlinesInside: 0 },
							{ group: "abstract-protected-readonly-property", newlinesInside: 0 },
							{ group: "abstract-protected-property", newlinesInside: 0 },
							{ group: "abstract-private-readonly-property", newlinesInside: 0 },
							{ group: "abstract-private-property", newlinesInside: 0 },
							{ group: "abstract-property", newlinesInside: 0 },

							{ group: "public-override-readonly-property", newlinesInside: 0 },
							{ group: "public-override-property", newlinesInside: 0 },
							{ group: "public-readonly-property", newlinesInside: 0 },
							{ group: "public-property", newlinesInside: 0 },
							{ group: "property", newlinesInside: 0 },

							{ group: "protected-override-readonly-property", newlinesInside: 0 },
							{ group: "protected-override-property", newlinesInside: 0 },
							{ group: "protected-readonly-property", newlinesInside: 0 },
							{ group: "protected-property", newlinesInside: 0 },

							{ group: "private-override-readonly-property", newlinesInside: 0 },
							{ group: "private-override-property", newlinesInside: 0 },
							{ group: "private-readonly-property", newlinesInside: 0 },
							{ group: "private-property", newlinesInside: 0 },

							"constructor",

							{ group: "get-method", newlinesInside: 1 },
							{ group: "protected-get-method", newlinesInside: 1 },
							{ group: "private-get-method", newlinesInside: 1 },

							{ group: "set-method", newlinesInside: 1 },
							{ group: "protected-set-method", newlinesInside: 1 },
							{ group: "private-set-method", newlinesInside: 1 },

							["static-method", "static-function-property"],
							["protected-static-method", "protected-static-function-property"],
							["private-static-method", "private-static-function-property"],

							["method", "function-property"],
							["protected-method", "protected-function-property"],
							["private-method", "private-function-property"],

							"unknown",
						],
						newlinesBetween: 1,
						newlinesInside: 1,
						partitionByComment: true,
						type: "alphabetical",
					},
				],
			},
		},
	],

	// Native Plugins — setting this overwrites defaults, so list the full base set
	plugins: ["eslint", "typescript", "unicorn", "oxc"],

	// Rules
	rules: {
		// Core language rules
		eqeqeq: ["error", "always", { null: "ignore" }],
		"no-console": "warn",

		// TypeScript (non-type-checking + type-aware when enabled at root)
		"typescript/consistent-type-definitions": ["error", "interface"],
		"typescript/explicit-function-return-type": "off",
		"typescript/no-explicit-any": "warn",
		"typescript/no-extraneous-class": "off",
		"typescript/no-non-null-assertion": "warn",
		"typescript/no-unused-vars": "warn",
		"typescript/prefer-optional-chain": "error",

		// Code style (via @stylistic jsPlugin)
		// Indent (tabs) — candidate to move to oxfmt later
		"@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
		"@stylistic/comma-dangle": ["error", "always-multiline"],
		"@stylistic/indent": ["error", "tab"],
		"@stylistic/key-spacing": [
			"error",
			{
				afterColon: true,
				beforeColon: false,
				mode: "strict",
			},
		],
		"@stylistic/multiline-ternary": "off",
		"@stylistic/no-mixed-spaces-and-tabs": "error",
		"@stylistic/no-multiple-empty-lines": [
			"error",
			{ max: 1, maxBOF: 0, maxEOF: 1 },
		],
		"@stylistic/no-tabs": "off",
		"@stylistic/operator-linebreak": "off",
		"@stylistic/semi": [
			"error",
			"always",
			{ omitLastInOneLineBlock: false },
		],
		"@stylistic/spaced-comment": [
			"error",
			"always",
			{
				block: {
					balanced: true,
					exceptions: ["*"],
					markers: ["!", "*"],
				},
				line: {
					exceptions: ["/", "-", "*", "="],
					markers: ["/"],
				},
			},
		],

		// Import sorting and organization
		"perfectionist/sort-imports": [
			"error",
			{
				groups: [
					["type"],
					["builtin", "external", "internal"],
					["style"],
					["import"],
				],
				ignoreCase: true,
				order: "asc",
				partitionByComment: true,
				specialCharacters: "keep",
				type: "natural",
			},
		],
		"perfectionist/sort-modules": "off",
		"perfectionist/sort-objects": ["error", { partitionByComment: true }],
	},
});
