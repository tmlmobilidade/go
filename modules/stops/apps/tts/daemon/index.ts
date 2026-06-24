/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

import { runnerCommon } from './runners/runner_common.js';
// import { runnerPatterns } from './runners/runner_patterns.js';
import { runnerStops } from './runners/runner_stops.js';

/* * */

async function main() {
	//

	Logger.init();

	const globalTimer = new Timer();

	await runnerStops();
	await runnerCommon();
	// await runnerPatterns();

	Logger.terminate(`TTS generation completed in ${globalTimer.get()}`);

	//
}

await runOnInterval(main, { intervalMs: '3h' });
