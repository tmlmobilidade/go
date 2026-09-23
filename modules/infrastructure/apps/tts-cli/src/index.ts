/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { generateCommonTtsTask } from './tasks/generate-common-tts.js';
import { generatePatternsTtsTask } from './tasks/generate-patterns-tts.js';
import { generateStopsTtsTask } from './tasks/generate-stops-tts.js';

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
