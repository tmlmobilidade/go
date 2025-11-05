import { Alert } from '@tmlmobilidade/go-types';

export function getAvailableLines(alert: Alert) {
	if (alert.reference_type === 'LINE') {
		return alert.references.map(reference => reference.parent_id);
	}

	if (alert.reference_type === 'STOP') {
		return alert.references.flatMap(reference => reference.child_ids);
	}

	return [];
}

export function getAvailableStops(alert: Alert) {
	if (alert.reference_type === 'LINE') {
		return alert.references.flatMap(reference => reference.child_ids);
	}

	if (alert.reference_type === 'STOP') {
		return alert.references.map(reference => reference.parent_id);
	}

	return [];
}
