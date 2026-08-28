/* * */

import { defineConfig } from 'oxlint';

import { commonConfig } from './common.js';
import { reactConfig } from './react.js';

/* * */

export const rulesConfig = defineConfig({
	extends: [commonConfig, reactConfig],
});