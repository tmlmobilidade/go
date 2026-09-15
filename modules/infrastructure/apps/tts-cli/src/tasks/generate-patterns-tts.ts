/* * */

import { piperTtsApi } from '@/services/piper-tts-api.js';
import { generateHash } from '@/utils/generate-hash.js';
import { makePattern } from '@/utils/make-text.js';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiLine, type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

/**
 * Generates the TTS audio files for every pattern headsign
 * of every line found in the cache, and updates the cached pattern hashes.
 */
export async function generatePatternsTtsTask() {
	//

	Logger.title('TTS PATTERNS');

	const globalTimer = new Timer();

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

	const allLinesData = JSON.parse(allLinesCachedData) as HubV1ApiLine[];

	Logger.title(`* Preparing ${allLinesData.length} lines...`);

	for (const [lineIndex, lineData] of allLinesData.entries()) {
		for (const [patternIndex, patternId] of lineData.pattern_ids.entries()) {
			let cachedData;

			try {
				cachedData = await cacheDb.getNew<HubV1ApiPattern[]>(`hub:v1:network:patterns:${patternId}`);
			} catch (error) {
				Logger.error({ error, message: `[hub/v1/network:getPatterns(${patternId})] Cache read failed` });
				continue;
			}

			if (!cachedData) {
				Logger.error({ message: `[hub/v1/network:getPatterns(${patternId})] No cached data found for pattern ${patternId}` });
				continue;
			}

			const patternGroup = cachedData.data;
			const patternData = patternGroup.at(-1);

			if (!patternData) continue;

			const patternTts = makePattern(lineData.short_name, patternData.headsign);

			if (patternTts && patternTts !== '#N/A') {
				const hash = await generateHash(patternTts, patternData._id);

				if (patternData.tts_headsign === hash) {
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
					await cacheDb.setNew(`hub:v1:network:patterns:${patternId}`, updatedPatternGroup);
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
