/* * */

import { piperTtsApi } from '@/services/piperTtsApi.js';
import { generateHash } from '@/utils/generateHash.js';
import { makePattern } from '@/utils/makeText.js';
import TIMETRACKER from '@helperkits/timer';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubLine, type HubPattern } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger-backend';

/* * */

export async function runnerPatterns() {
	//

	Logger.title(`TTS PATTERNS`);

	const globalTimer = new TIMETRACKER();

	Logger.title('* Fetching all lines from cache...');

	let allLinesCachedData: null | string;

	try {
		allLinesCachedData = await cacheDb.get('hub:v1:network:lines');
	} catch (error) {
		Logger.error({ error, message: '[hub/v1/network:getLines()] Cache read failed' });
		return;
	}

	if (!allLinesCachedData) {
		Logger.error({ message: '[hub/v1/network:getLines()] No cached data found for lines' });
		return;
	}

	const allLinesData = JSON.parse(allLinesCachedData) as HubLine[];

	Logger.title(`* Preparing ${allLinesData.length} lines...`);

	for (const [lineIndex, lineData] of allLinesData.entries()) {
		for (const [patternIndex, patternId] of lineData.pattern_ids.entries()) {
			let cachedData: null | string;

			try {
				cachedData = await cacheDb.get(`hub:v1:network:patterns:${patternId}`);
			} catch (error) {
				Logger.error({ error, message: `[hub/v1/network:getPatterns(${patternId})] Cache read failed` });
				continue;
			}

			if (!cachedData) {
				Logger.error({ message: `[hub/v1/network:getPatterns(${patternId})] No cached data found for pattern ${patternId}` });
				continue;
			}

			const patternGroup = JSON.parse(cachedData) as HubPattern[];
			const patternData = patternGroup.at(-1);

			if (!patternData) continue;

			const patternTts = makePattern(lineData.short_name, patternData.headsign);

			if (patternTts && patternTts !== '#N/A') {
				const hash = await generateHash(patternTts, patternData._id);

				if (patternData.tts_hash === hash) {
					Logger.info({
						message: `[${lineIndex + 1}/${allLinesData.length}] [${patternIndex + 1}/${lineData.pattern_ids.length}] Skipping | Line ${lineData._id} | Pattern ${patternData._id} | TTS already exists`,
					});
					continue;
				}

				Logger.info({
					message: `[${lineIndex + 1}/${allLinesData.length}] [${patternIndex + 1}/${lineData.pattern_ids.length}] Generating | Line ${lineData._id} | Pattern ${patternData._id} | ${patternTts}`,
				});

				await piperTtsApi({ filename: patternId, force: true, resourceType: 'patterns', string: patternTts });

				const updatedPatternGroup = patternGroup.map(patternData => ({ ...patternData, tts_hash: hash }));

				try {
					await cacheDb.set(`hub:v1:network:patterns:${patternId}`, JSON.stringify(updatedPatternGroup));
					Logger.success(`[hub/v1/network:getPatterns(${patternId})] Cached data updated for pattern ${patternId}`);
				} catch (error) {
					Logger.error({ error, message: `[hub/v1/network:getPatterns(${patternId})] Error updating cached data for pattern ${patternId}` });
					continue;
				}
			}
		}
	}

	Logger.success(`Processed patterns for ${allLinesData.length} lines (${globalTimer.get()}).`);

	//
};
