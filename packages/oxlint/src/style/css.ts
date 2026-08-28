import type { Config } from 'stylelint';

/**
 * Stylelint configuration for CSS files.
 *
 * This configuration extends standard and recess-order presets,
 * and enables automatic fixing. It enforces rules focused on
 * property declaration order, whitespace, selector naming conventions
 * (enforces camelCase for classes and IDs), and restricts the set of
 * allowed units to a small, maintainable subset.
 *
 * @see https://stylelint.io/
 * @type {Config}
 */
export const cssConfig: Config = {
	extends: [
		'stylelint-config-standard',
		'stylelint-config-recess-order',
	],
	fix: true,
	rules: {
		// Require an empty line before comments, except after another comment
		'comment-empty-line-before': ['always', { ignore: ['after-comment'] }],

		// Disallow duplicate properties within declaration blocks
		'declaration-block-no-duplicate-properties': true,

		// Disallow shorthand property overrides within declaration blocks
		'declaration-block-no-shorthand-property-overrides': true,

		// Limit the number of declarations within single-line declaration blocks to zero for consistency
		'declaration-block-single-line-max-declarations': 0,

		// Disallow an empty line before declarations
		'declaration-empty-line-before': ['never'],

		// Disallow unspaced operators in calc functions
		'function-calc-no-unspaced-operator': true,

		// Disallow units for zero lengths
		'length-zero-no-unit': true,

		// Disallow irregular whitespace
		'no-irregular-whitespace': true,

		// Require an empty line before rules, except inside blocks or after comments, and only for multi-line rules
		'rule-empty-line-before': ['always-multi-line', { ignore: ['inside-block', 'after-comment'] }],

		// Enforce camelCase for class selectors
		'selector-class-pattern': [
			/^[a-z]+([A-Z][a-z0-9]*)*$/,
			{ message: 'Selector should be written in camelCase.' },
		],

		// Enforce camelCase for ID selectors
		'selector-id-pattern': [
			/^[a-z]+([A-Z][a-z0-9]*)*$/,
			{ message: 'Selector should be written in camelCase.' },
		],

		// Disallow redundant values in shorthand properties
		'shorthand-property-no-redundant-values': true,

		// Allow only a restricted set of CSS units
		'unit-allowed-list': ['px', '%', 'fr', 'ms', 'deg', 'vh', 'vw'],
	},
};
