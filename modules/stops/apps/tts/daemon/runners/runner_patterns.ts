/* * */

import { makePattern } from '@/utils/makeText.js';
import TIMETRACKER from '@helperkits/timer';
import { type HubLine, type HubPattern } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';

import { piperTtsApi } from '../services/piperTtsApi.js';

/* * */

export async function runnerPatterns() {
	//

	Logger.title(`TTS PATTERNS`);
	const globalTimer = new TIMETRACKER();

	console.log('* Fetching all lines from API...');
	const allLinesResponse = await fetch('https://go.tmlmobilidade.pt/hub/api/v1/network/lines');
	const allLinesData = await allLinesResponse.json() as HubLine[];

	console.log(`* Preparing ${allLinesData.length} lines...`);

	for (const [lineIndex, lineData] of allLinesData.entries()) {
		for (const [patternIndex, patternId] of lineData.pattern_ids.entries()) {
			const patternResponse = await fetch(`https://go.tmlmobilidade.pt/hub/api/v1/network/patterns/${patternId}`);
			const patternGroup = await patternResponse.json() as HubPattern[];
			const patternData = patternGroup.pop();

			const patternTts = makePattern(lineData.short_name, patternData.headsign);

			if (patternTts && patternTts !== '#N/A') {
				Logger.info({
					message: `[${lineIndex + 1}/${allLinesData.length}] [${patternIndex + 1}/${lineData.pattern_ids.length}] Generating | Line ${lineData._id} | Pattern ${patternData._id} | ${patternTts}`,
				});

				await piperTtsApi({
					filename: patternId,
					force: true,
					string: patternTts,
				});
			}
		}
	}

	Logger.success(`Processed patterns for ${allLinesData.length} lines (${globalTimer.get()}).`);

	//
};
