/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { generateCommonTtsTask } from './tasks/generate-common-tts.js';
import { generatePatternsTtsTask } from './tasks/generate-patterns-tts.js';
import { generateStopsTtsTask } from './tasks/generate-stops-tts.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'tts-cli', message: 'Sentry Stops TTS CLI initialized', module: 'stops', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Stops TTS CLI' });
}

/* * */

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run tasks

	await generateStopsTtsTask();
	await generateCommonTtsTask();
	await generatePatternsTtsTask();

	//
	// Log completion

	Logger.terminate(`TTS generation completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '3h' });
