/* * */

import { runnerCommon } from '@/src/runners/runner_common.js';
import { runnerStops } from '@/src/runners/runner_stops.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

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
