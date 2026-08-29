import { defineConfig } from "oxlint";

/**
 * Non-type-checking TypeScript rules (plus type-aware ones when enabled).
 *
 * Prefers `interface` over `type`, warns on `any` / non-null assertions /
 * unused vars, and requires optional chaining where applicable.
 *
 * Sets `plugins: []` so this fragment does not pull default plugins into
 * the extends union when composed by {@link lintConfig}.
 *
 * @see https://oxc.rs/docs/guide/usage/linter/rules.html
 */
export const typescriptConfig = defineConfig({
	// Do not contribute default plugins into the extends union.
	plugins: [],

	rules: {
		"typescript/consistent-type-definitions": ["error", "interface"],
		"typescript/explicit-function-return-type": "off",
		"typescript/no-explicit-any": "warn",
		"typescript/no-extraneous-class": "off",
		"typescript/no-non-null-assertion": "warn",
		"typescript/no-unused-vars": "warn",
		"typescript/prefer-optional-chain": "error",
	},
});
