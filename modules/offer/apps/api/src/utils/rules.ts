import { resolvePatternRules } from '@tmlmobilidade/dates';
import { events, lines } from '@tmlmobilidade/interfaces';
import { type Pattern } from '@tmlmobilidade/types';

export async function mergePatternWithEventRules(pattern: Pattern): Promise<Pattern> {
	const line = await lines.findById(pattern.line_id);
	if (!line) return pattern;

	// Fetch all events for this agency - filtering happens at the rule level
	const candidateEvents = await events.findMany({
		agency_ids: { $in: [line.agency_id] },
	});

	const finalRules = resolvePatternRules(pattern, candidateEvents);

	// IMPORTANT:
	// - Keep only manual rules persisted on pattern
	// - Return union list to the frontend by appending event rules
	return {
		...pattern,
		rules: finalRules,
	};
}
