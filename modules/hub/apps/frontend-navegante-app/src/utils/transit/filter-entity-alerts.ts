import { type HubV1ApiAlert, type HubV1ApiLine, type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';

/* * */

type AlertScope = Pick<HubV1ApiAlert, 'agency_id' | 'reference_type' | 'references'>;

interface LineAlertScope {
	_id: HubV1ApiLine['_id']
	agency_id: HubV1ApiLine['agency_id']
}

interface StopAlertScope {
	_id: HubV1ApiStop['_id']
	agency_ids: HubV1ApiStop['agency_ids']
	line_ids: HubV1ApiStop['line_ids']
}

/* * */

/**
 * Published JSON references, from the publish-alerts transforms:
 * - agency: parent_id is the agency id
 * - lines: parent_id is the qualified line id; child_ids are stop ids (empty means the whole line)
 * - stops: parent_id is the stop id; child_ids are qualified line ids (empty means every line at that stop)
 */
export function filterAlertsForStop<TAlert extends AlertScope>(alerts: TAlert[], stop: StopAlertScope | undefined): TAlert[] {
	if (!stop) return [];
	return alerts.filter(alert => alertAppliesToStop(alert, stop));
}

export function filterAlertsForLine<TAlert extends AlertScope>(alerts: TAlert[], line: LineAlertScope | undefined, stopIdsOnLine: ReadonlySet<string>): TAlert[] {
	if (!line) return [];
	return alerts.filter(alert => alertAppliesToLine(alert, line, stopIdsOnLine));
}

/* * */

function alertAppliesToStop(alert: AlertScope, stop: StopAlertScope): boolean {
	if (alert.reference_type === 'agency') return stop.agency_ids.includes(alert.agency_id);

	if (alert.reference_type === 'stops') {
		return alert.references.some(reference => reference.parent_id === String(stop._id));
	}

	if (alert.reference_type === 'lines') {
		return alert.references.some((reference) => {
			if (!stop.line_ids.includes(reference.parent_id)) return false;
			if (reference.child_ids.length === 0) return true;
			return reference.child_ids.includes(String(stop._id));
		});
	}

	return false;
}

function alertAppliesToLine(alert: AlertScope, line: LineAlertScope, stopIdsOnLine: ReadonlySet<string>): boolean {
	if (alert.reference_type === 'agency') return alert.agency_id === line.agency_id;

	if (alert.reference_type === 'lines') {
		return alert.references.some(reference => reference.parent_id === line._id);
	}

	if (alert.reference_type === 'stops') {
		return alert.references.some((reference) => {
			if (reference.child_ids.length > 0) return reference.child_ids.includes(line._id);
			return stopIdsOnLine.has(reference.parent_id);
		});
	}

	return false;
}
