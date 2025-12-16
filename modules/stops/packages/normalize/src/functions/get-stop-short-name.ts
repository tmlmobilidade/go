/* * */

import { Logger } from '@tmlmobilidade/logger';
import { normalizeString } from '@tmlmobilidade/strings';
import { StopNameAbbreviationRules } from '@tmlmobilidade/types';

/**
 * Sets the short name for a stop based on its regular name.
 * @param name The regular name of the stop.
 * @returns The abbreviated short name of the stop.
 */
export function getStopShortName(name: string): string {
	//

	if (!name) {
		Logger.error(`Stop name is not provided.`);
		return '';
	}

	//
	// Generate the short name

	const activeRules = StopNameAbbreviationRules
		.filter(r => r.enabled)
		.sort((a, b) => b.phrase.length - a.phrase.length);

	let shortenedName = normalizeString(name);

	for (const rule of activeRules) {
		const escaped = rule.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
		shortenedName = shortenedName.replace(regex, (match) => {
			if (match[0] === match[0].toUpperCase()) {
				return rule.replacement.charAt(0).toUpperCase() + rule.replacement.slice(1);
			}
			return rule.replacement;
		});
	}

	return shortenedName.trim();

	//
}
