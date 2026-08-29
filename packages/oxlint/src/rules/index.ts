import { defineConfig } from "oxlint";

import { classesConfig } from "./classes.js";
import { importsConfig } from "./imports.js";
import { indentConfig } from "./indent.js";
import { jsonConfig } from "./json.js";
import { packageJsonConfig } from "./pjson.js";
import { promisesConfig } from "./promises.js";
import { reactConfig } from "./react.js";
import { styleConfig } from "./style.js";
import { tsconfigConfig } from "./tsconfig.js";
import { typescriptConfig } from "./typescript.js";

/**
 * Shared Node/TS Oxlint base config.
 *
 * Owns environment, ignore patterns, native/JS plugins, and core language
 * rules. Concern-specific rule sets are composed via `extends`.
 *
 * Not ported yet:
 * - `import/no-extraneous-dependencies` (needs `eslint-plugin-import` JS plugin)
 * - `@typescript-eslint/naming-convention` (type-aware; Oxlint JS plugins
 *   cannot supply type info, and the rule is not in native tsgolint)
 * - JSON / package.json / tsconfig rules are configured but inert until
 *   Oxlint supports custom file parsers (`jsonc-eslint-parser`)
 *
 * @see https://oxc.rs/docs/guide/usage/linter/rules.html
 */
export const lintConfig = defineConfig({
	extends: [
		classesConfig,
		importsConfig,
		indentConfig,
		jsonConfig,
		packageJsonConfig,
		promisesConfig,
		reactConfig,
		styleConfig,
		tsconfigConfig,
		typescriptConfig,
	],

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
	jsPlugins: [
		"@stylistic/eslint-plugin",
		"eslint-plugin-jsonc",
		"eslint-plugin-perfectionist",
	],

	// Native Plugins — setting this overwrites defaults, so list the full base set
	plugins: ["eslint", "typescript", "unicorn", "oxc", "react", "nextjs"],

	// Core language rules
	rules: {
		eqeqeq: ["error", "always", { null: "ignore" }],
		"no-console": "warn",
	},
});
