import { resolvePatternRules } from '@tmlmobilidade/dates';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Pattern } from '@tmlmobilidade/go-types-offer';

export async function mergePatternWithEventRules(pattern: Pattern): Promise<Pattern> {
	const line = await goDb.offer.lines.findById(pattern.line_id);
	if (!line) return pattern;

	// Fetch all events for this agency - filtering happens at the rule level
	const candidateEvents = await goDb.offer.events.findMany({
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
