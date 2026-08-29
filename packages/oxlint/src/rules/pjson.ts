import { defineConfig } from "oxlint";

/**
 * Rules applied to `package.json` for consistent key order.
 *
 * Currently inert: Oxlint has no custom file-parser API, so JSON cannot
 * be linted yet. Kept ready for when that lands.
 *
 * Sets `plugins: []` so this fragment does not pull default plugins into
 * the extends union when composed by {@link lintConfig}.
 *
 * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/sort-keys.html
 */
export const packageJsonConfig = defineConfig({
	overrides: [
		{
			files: ["**/package.json"],
			rules: {
				"jsonc/sort-keys": [
					"error",
					{
						order: [
							"name",
							"description",
							"version",
							"author",
							"license",
							"homepage",
							"bugs",
							"repository",
							"keywords",
							"private",
							"publishConfig",
							"type",
							"files",
							"main",
							"types",
							"exports",
							"scripts",
							"dependencies",
							"devDependencies",
						],
						pathPattern: "^$",
					},
					{
						hasProperties: ["types", "import"],
						order: ["types", "import"],
						pathPattern: ".*",
					},
					{
						hasProperties: ["types", "default"],
						order: ["types", "default"],
						pathPattern: ".*",
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
