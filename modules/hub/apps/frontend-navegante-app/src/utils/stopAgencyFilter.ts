import { type TransportOption } from '@/contexts/GlobalSettings.context';
import { type Line, type NetworkRoute, type NetworkStop } from '@/types/api/network';
import { agencyMatchesSelection, agencyMatchesTransports, transportsSelectionIsAll } from '@/utils/transportAgencies';

function addRef(map: Map<string, string>, ref: string | undefined, agencyId: string | undefined) {
	if (!ref || !agencyId) return;
	map.set(ref, agencyId);
}

export function buildRefToAgencyIdMap(lines: Line[], routes: NetworkRoute[]): Map<string, string> {
	const map = new Map<string, string>();
	for (const line of lines) {
		addRef(map, line.id, line.agency_id);
		addRef(map, line.short_name, line.agency_id);
	}
	for (const route of routes) {
		addRef(map, route.id, route.agency_id);
		addRef(map, route.short_name, route.agency_id);
	}
	return map;
}

export function getAgencyIdsForStop(stop: NetworkStop, refToAgency: Map<string, string>): string[] {
	const agencyIds = new Set<string>();
	for (const ref of [...(stop.line_ids ?? []), ...(stop.route_ids ?? [])]) {
		const agencyId = refToAgency.get(ref);
		if (agencyId) agencyIds.add(agencyId);
	}
	return [...agencyIds];
}

export function stopMatchesAgencyTransportFilters(stop: NetworkStop, refToAgency: Map<string, string>, filterByAgency: string[], filterByTransports: TransportOption[]) {
	const isAllAgencies = filterByAgency.length === 0;
	const isAllTransports = transportsSelectionIsAll(filterByTransports);
	if (isAllAgencies && isAllTransports) return true;

	const agencyIds = getAgencyIdsForStop(stop, refToAgency);
	if (agencyIds.length === 0) return false;

	return agencyIds.some((agencyId) => {
		return (isAllAgencies || agencyMatchesSelection(agencyId, filterByAgency)) && (isAllTransports || agencyMatchesTransports(agencyId, filterByTransports));
	});
}
