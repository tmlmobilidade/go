import { node } from '@tmlmobilidade/eslint';

export default [
	...node,
	{ files: ['tests/**/*.ts'], languageOptions: { parserOptions: { project: './tsconfig.check.json' } } },
];
