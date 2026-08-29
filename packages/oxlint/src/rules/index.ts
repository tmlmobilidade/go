import { defineConfig } from "oxlint";

import { classesConfig } from "./classes.js";
import { importsConfig } from "./imports.js";
import { promisesConfig } from "./promises.js";
import { reactConfig } from "./react.js";
import { styleConfig } from "./style.js";
import { typescriptConfig } from "./typescript.js";

/**
 * Shared Node/TS Oxlint base config.
 *
 * Owns environment, ignore patterns, native/JS plugins, and core language
 * rules. Concern-specific rule sets are composed via `extends`
 * ({@link classesConfig}, {@link importsConfig}, {@link promisesConfig},
 * {@link reactConfig}, {@link styleConfig}, {@link typescriptConfig}).
 *
 * Not ported yet (no native rule / needs extra JS plugins):
 * - `import/no-extraneous-dependencies`
 * - `@typescript-eslint/naming-convention`
 * - `eslint-plugin-jsonc` (JSON / package.json / tsconfig)
 *
 * @see https://oxc.rs/docs/guide/usage/linter/rules.html
 */
export const lintConfig = defineConfig({
	extends: [
		classesConfig,
		importsConfig,
		promisesConfig,
		reactConfig,
		styleConfig,
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
	jsPlugins: ["@stylistic/eslint-plugin", "eslint-plugin-perfectionist"],

	// Native Plugins — setting this overwrites defaults, so list the full base set
	plugins: ["eslint", "typescript", "unicorn", "oxc", "react", "nextjs"],

	// Core language rules
	rules: {
		eqeqeq: ["error", "always", { null: "ignore" }],
		"no-console": "warn",
	},
});
