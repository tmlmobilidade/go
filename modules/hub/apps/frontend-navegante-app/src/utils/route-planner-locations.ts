import { type RoutePlannerLocation } from '@/utils/route-planner-motis';
import { type HubStop } from '@tmlmobilidade/go-types-public-info';

/* * */

interface MapHubStopToRoutePlannerLocationOptions {
	ensureGtfsId?: boolean
}

/* * */

export function mapHubStopToRoutePlannerLocation(stop: HubStop, options?: MapHubStopToRoutePlannerLocationOptions): RoutePlannerLocation {
	const stopId = String(stop._id);

	return {
		detail: [stop.locality_name, stop.municipality_name].filter(Boolean).join(' | '),
		id: options?.ensureGtfsId ? `GTFS_${stopId.replace(/^GTFS_/, '')}` : stopId,
		label: stop.name,
		lat: stop.latitude,
		lon: stop.longitude,
		type: 'STOP',
	};
}
