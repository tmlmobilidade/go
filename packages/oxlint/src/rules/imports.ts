import { defineConfig } from "oxlint";

/**
 * Import and object sorting via `eslint-plugin-perfectionist`.
 *
 * Groups imports (type → builtin/external/internal → style → side-effect),
 * sorts objects alphabetically with comment partitions, and leaves module
 * member sorting off.
 *
 * Sets `plugins: []` so this fragment does not pull default plugins into
 * the extends union when composed by {@link commonConfig}.
 *
 * @see https://perfectionist.dev/
 */
export const importsConfig = defineConfig({
	// Do not contribute default plugins into the extends union.
	plugins: [],

	rules: {
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
