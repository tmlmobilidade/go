/* * */

import { StopNameAbbreviationRules, StopSchema } from '@tmlmobilidade/types';

/**
 * Sets the short name for a stop based on its regular name.
 * @param name The regular name of the stop.
 * @returns The abbreviated short name of the stop.
 */
export function getStopShortName(name: string): string {
	//

	if (!name) return '';

	//
	// Generate the short name

	const activeRules = StopNameAbbreviationRules
		.filter(r => r.enabled)
		.sort((a, b) => b.phrase.length - a.phrase.length);

	let shortenedName = name;

	for (const rule of activeRules) {
		const escaped = rule.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
		shortenedName = shortenedName.replace(regex, (match) => {
			console.log('Match:', match, 'Replacement:', rule.replacement);
			if (match[0] === match[0].toUpperCase()) {
				return rule.replacement.charAt(0).toUpperCase() + rule.replacement.slice(1);
			}
			return rule.replacement;
		});
	}

	return shortenedName
		.trim()
		.slice(0, StopSchema.shape.short_name.maxLength ?? 55);

	//
}
