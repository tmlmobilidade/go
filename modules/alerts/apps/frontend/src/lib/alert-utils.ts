/* * */

import { Alert } from '@tmlmobilidade/types';

/* * */

export function getAvailableLines(alert: Alert) {
	// For lines references, return parent IDs (line IDs)
	if (alert.reference_type === 'lines') return alert.references.map(reference => reference.parent_id);
	// For stops references, return child IDs (line IDs)
	if (alert.reference_type === 'stops') return alert.references.flatMap(reference => reference.child_ids);
	// Otherwise, return an empty array
	return [];
}

export function getAvailableStops(alert: Alert) {
	// For lines references, return child IDs (stop IDs)
	if (alert.reference_type === 'lines') return alert.references.flatMap(reference => reference.child_ids);
	// For stops references, return parent IDs (stop IDs)
	if (alert.reference_type === 'stops') return alert.references.map(reference => reference.parent_id);
	// Otherwise, return an empty array
	return [];
}
