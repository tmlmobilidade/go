import { defineConfig } from "oxlint";

/**
 * Code-style rules via the `@stylistic` JS plugin.
 *
 * Covers brace style, trailing commas, key spacing, semis, empty lines,
 * and spaced comments. Indentation lives in {@link indentConfig}.
 * Formatting-only candidates may move to oxfmt later.
 *
 * Sets `plugins: []` so this fragment does not pull default plugins into
 * the extends union when composed by {@link lintConfig}.
 *
 * @see https://eslint.style/
 */
export const styleConfig = defineConfig({
	// Do not contribute default plugins into the extends union.
	plugins: [],

	rules: {
		"@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
		"@stylistic/comma-dangle": ["error", "always-multiline"],
		"@stylistic/key-spacing": [
			"error",
			{
				afterColon: true,
				beforeColon: false,
				mode: "strict",
			},
		],
		"@stylistic/multiline-ternary": "off",
		"@stylistic/no-multiple-empty-lines": [
			"error",
			{ max: 1, maxBOF: 0, maxEOF: 1 },
		],
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
	},
});
