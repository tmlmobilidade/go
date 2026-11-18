/* * */

import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';

/* * */

export function hasJustificationHistory(acceptance: RideAcceptance): boolean {
	if (acceptance.justification) return true;

	return acceptance.comments?.some((comment) => {
		if (comment.type !== 'field_changed') return false;

		const changes = comment.field === 'multiple_fields' ? comment.metadata?.changes ?? [] : [comment];
		return changes.some((change) => {
			if (change.field === 'justification') return true;
			return change.field === 'acceptance_status' && change.curr_value === 'justification_required' && comment.created_by !== 'system';
		});
	}) ?? false;
}
