/* * */

import { watch } from 'rollup';

import { buildStyles } from './build-styles';
import { rollupConfig } from './rollup/config';

/* * */

async function watchBuild() {
	console.log('Starting watch mode...');

	const config = rollupConfig();

	const watcher = watch(
		config.map(c => ({
			...c,
			// Optimized watch settings for faster rebuilds
			watch: {
				// Reduced delay to batch rapid file changes
				buildDelay: 50,
				chokidar: {
					// Disable polling for better performance on macOS/Linux
					usePolling: false,
					// Ignore node_modules and dist for faster watching
					ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
				},
				// Clear screen on rebuild for cleaner output
				clearScreen: false,
			},
		})),
	);

	watcher.on('event', async (event) => {
		switch (event.code) {
			case 'BUNDLE_END':
				console.log('Bundle completed.');
				// Only rebuild types when explicitly needed or on first build
				// Skip type generation in watch mode for faster rebuilds
				break;
			case 'BUNDLE_START':
				console.log('Bundling...');
				break;
			case 'END':
				console.log('Build finished.');
				buildStyles();
				// pushToYalc();
				break;
			case 'ERROR':
				console.error('Error:', event.error);
				break;
			case 'START':
				console.log('Building...');
				break;
			default:
				break;
		}
	});

	// Handle process termination
	process.on('SIGTERM', () => watcher.close());
	process.on('SIGINT', () => watcher.close());
	process.on('exit', () => watcher.close());
}

/* * */

watchBuild();
