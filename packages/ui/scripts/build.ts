/* * */

import { buildStyles } from './build-styles';
import { compile } from './rollup/compile';
import { rollupConfig } from './rollup/config';

/* * */

async function build() {
	console.log('Building UI...');
	const config = rollupConfig();
	await compile(config);

	console.log('Building styles...');
	buildStyles();

	console.log('UI built successfully');
}

build();
