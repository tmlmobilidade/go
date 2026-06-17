/* * */

import { makePattern } from '@/utils/makeText.js';
import TIMETRACKER from '@helperkits/timer';
import { Logger } from '@tmlmobilidade/logger';
import { type HubLine, type HubPattern } from '@tmlmobilidade/types';

import { piperTtsApi } from '../services/piperTtsApi.js';
import { Tracker, type TrackerItem } from '../services/Tracker.js';
/* * */

const OUTPUTS_DIRNAME = './outputs/patterns';

export async function runnerPatterns() {
	//

	Logger.title(`TTS PATTERNS`);
	const globalTimer = new TIMETRACKER();

	// Setup tracker
	const trackerData = Tracker.get('patterns');
	const trackerDataUpdated: TrackerItem[] = [];

	// Get all lines
	console.log('* Fetching all lines from API...');
	const allLinesResponse = await fetch('https://go.tmlmobilidade.pt/hub/api/v1/network/lines');
	const allLinesData = await allLinesResponse.json() as HubLine[];

	// Log progress
	console.log(`* Preparing ${allLinesData.length} lines...`);
	console.log();

	// Iterate on each stop
	for (const [lineIndex, lineData] of allLinesData.entries()) {
		//

		// 1.
		// For each pattern of this line

		for (const [patternIndex, patternId] of lineData.pattern_ids.entries()) {
			//

			const patternResponse = await fetch(`https://api.carrismetropolitana.pt/v2/patterns/${patternId}`);
			const patternGroup = await patternResponse.json() as HubPattern[];
			const patternData = patternGroup.pop();

			const patternTts = makePattern(lineData.short_name, patternData.headsign);

			// Check if tracker already has this entry,
			// and if it differs from the generated TTS.
			const trackerEntry = trackerData.find(item => item.id === patternId);
			const ttsHasChanged = patternTts !== trackerEntry?.tts;

			if (ttsHasChanged && patternTts && patternTts !== '#N/A') {
				Logger.info(`[${lineIndex + 1}/${allLinesData.length}] [${patternIndex + 1}/${lineData.pattern_ids.length}] Generating | Line ${lineData._id} | Pattern ${patternData._id} | ${patternTts}`);

				await piperTtsApi({
					dirname: OUTPUTS_DIRNAME,
					filename: patternId,
					force: true,
					string: patternTts,
				});
			}

			trackerDataUpdated.push({ id: patternId, tts: patternTts });

			//
		}
	}

	// Save updated tracker
	Tracker.set('patterns', trackerDataUpdated);

	// Clean directory
	Tracker.clean('patterns');

	// Zip directory
	Tracker.zip('patterns');

	//

	Logger.success(`Processed ${trackerDataUpdated.length} "pattern" items (${globalTimer.get()}).`);

	//
};
