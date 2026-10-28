/* * */

import { type HubV1ApiStop, HubV1ApiStopSchema } from '@tmlmobilidade/go-types-hub';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';

/* * */

export function parseStop(stop: Stop, agencyId: string): HubV1ApiStop {
	const { location } = stop;

	return HubV1ApiStopSchema.parse({
		_id: stop._id,
		agency_ids: [agencyId],
		district_id: String(location.primary.osm_id),
		district_name: location.primary.name,
		flags: stop.flags.filter(flag => flag.agency_ids.includes(agencyId)).map(flag => ({ agency_id: agencyId, stop_id: flag.stop_id })),
		latitude: stop.latitude,
		legacy_ids: stop.legacy_ids,
		lifecycle_status: stop.lifecycle_status,
		line_ids: [],
		locality_id: location.neighbourhood ? String(location.neighbourhood.osm_id) : '-',
		locality_name: location.neighbourhood?.name ?? '-',
		longitude: stop.longitude,
		municipality_id: String(location.secondary.osm_id),
		municipality_name: location.secondary.name,
		name: stop.name,
		parish_id: String(location.tertiary.osm_id),
		parish_name: location.tertiary.name,
		pattern_ids: [],
		route_ids: [],
		short_name: stop.name,
		tts_name: stop.tts_name || stop.name,
	});
}
