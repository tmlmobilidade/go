/* * */

import { StopOptions } from '@/schemas/options';

/* * */

function normalizeInput(input: string): string {
	return input
		.normalize('NFC') // Unicode normalization
		.replace(/\s+/g, ' ') // collapse whitespace
		.trim();
}

/* * */

export function abbreviateName(input: string): string {
	const normalized = normalizeInput(input);

	const activeRules = StopOptions.name_abbreviations
		.filter(r => r.enabled)
		.sort((a, b) => b.phrase.length - a.phrase.length);

	let result = normalized;

	for (const rule of activeRules) {
		const escaped = rule.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`\\b${escaped}\\b`, 'gi');

		result = result.replace(regex, (match) => {
			if (match[0] === match[0].toUpperCase()) {
				return rule.replacement.charAt(0).toUpperCase() + rule.replacement.slice(1);
			}
			return rule.replacement;
		});
	}

	return result;
}
