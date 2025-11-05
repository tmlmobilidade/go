/* * */

import { spawnSync } from 'child_process';
import path, { dirname } from 'path';
import { watch } from 'rollup';
import { fileURLToPath } from 'url';

import { buildStyles } from './build-styles';
import { rollupConfig } from './rollup/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const YALC_SCRIPT_PATH = path.resolve(__dirname, '..', '..', '..');

/* * */

async function watchBuild() {
	console.log('Starting watch mode...');

	const config = rollupConfig();

	const watcher = watch(config);

	watcher.on('event', async (event) => {
		switch (event.code) {
			case 'BUNDLE_END':
				console.log('Bundle completed.');
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

function pushToYalc() {
	console.log('Checking for Yalc installation...');

	try {
		const versionResult = spawnSync('yalc', ['--version'], {
			encoding: 'utf-8',
			stdio: 'pipe',
		});

		if (versionResult.status === 0) {
			console.log(`Yalc version: ${versionResult.stdout.trim()}`);
		}
		else {
			console.warn(`Yalc not found: ${versionResult.stderr.trim()}`);
			console.log('Yalc is not installed, skipping push.');
			return;
		}
	}
	catch (error) {
		console.error('Error checking Yalc installation:', error);
		console.log('Yalc is not installed, skipping push.');
		return;
	}

	console.log('Pushing to Yalc...');
	try {
		const pushResult = spawnSync('npm', ['run', 'yalc:push', '--prefix', YALC_SCRIPT_PATH], {
			encoding: 'utf-8',
			stdio: 'pipe',
		});

		if (pushResult.status === 0) {
			console.log(pushResult.stdout.trim());
			console.log('Successfully pushed to Yalc.');
		}
		else {
			console.error('Error pushing to Yalc:', pushResult.stderr.trim());
		}
	}
	catch (error) {
		console.error('Exception while pushing to Yalc:', error);
	}
}

/* * */

watchBuild();
