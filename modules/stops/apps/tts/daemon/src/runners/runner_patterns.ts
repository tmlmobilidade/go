/* * */

import { SETTINGS } from '@/config/settings.js';
import { googleCloudTtsApi } from '@/services/googleCloudTtsApi.js';
import { Tracker, type TrackerItem } from '@/services/Tracker.js';
import { type Line, type Pattern } from '@carrismetropolitana/api-types/network';
import tts from '@carrismetropolitana/tts';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';

/* * */

export async function runnerPatterns() {
	//

	LOGGER.title(`TTS PATTERNS`);
	const globalTimer = new TIMETRACKER();

	// Setup tracker
	const trackerData = Tracker.get('patterns');
	const trackerDataUpdated: TrackerItem[] = [];

	// Get all lines
	console.log('* Fetching all lines from API...');
	const allLinesResponse = await fetch('https://api.carrismetropolitana.pt/v2/lines');
	const allLinesData = await allLinesResponse.json() as Line[];

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
			const patternGroup = await patternResponse.json() as Pattern[];
			const patternData = patternGroup.pop();

			const patternTts = tts.makePattern(lineData.short_name, patternData.headsign);

			// Check if tracker already has this entry,
			// and if it differs from the generated TTS.
			const trackerEntry = trackerData.find(item => item.id === patternId);
			const ttsHasChanged = patternTts !== trackerEntry?.tts;

			if (ttsHasChanged) {
				await googleCloudTtsApi({
					dirname: `${SETTINGS.OUTPUTS_DIRNAME}/patterns`,
					filename: patternId,
					replaceIfExists: true,
					string: patternTts,
				});
				LOGGER.info(`[${lineIndex}/${allLinesData.length}] [${patternIndex}/${lineData.pattern_ids.length}] Generated | Line ${lineData.id} | Pattern ${patternData.id} | ${patternTts}`);
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

	LOGGER.success(`Processed ${trackerDataUpdated.length} "pattern" items (${globalTimer.get()}).`);

	//
};
