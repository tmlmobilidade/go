/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type HashedTrip } from '@tmlmobilidade/go-types-operation';

import { ML_AGENCY_ID, type TripPathWaypoint } from './types.js';

/* * */

interface StopCodeSource {
	flags: {
		agency_ids: string[]
		stop_id: string
	}[]
}

export function addStopCodesToTripPath(path: HashedTrip[], stopDocs: StopCodeSource[]): TripPathWaypoint[] {
	const stopCodesByCode = new Map<string, string[]>();

	for (const stop of stopDocs) {
		const agencyStopCodes = stop.flags
			.filter(flag => flag.agency_ids.includes(ML_AGENCY_ID))
			.map(flag => flag.stop_id);

		for (const stopCode of agencyStopCodes) {
			stopCodesByCode.set(stopCode, agencyStopCodes);
		}
	}

	return path.map(waypoint => ({
		...waypoint,
		stop_codes: stopCodesByCode.get(waypoint.stop_id) ?? [],
	}));
}

export async function enrichTripPathWithStopCodes(path: HashedTrip[]): Promise<TripPathWaypoint[]> {
	const stopDocs = await goDb.infrastructure.stops.findMany(
		{
			flags: {
				$elemMatch: {
					agency_ids: ML_AGENCY_ID,
					stop_id: { $in: path.map(waypoint => waypoint.stop_id) },
				},
			},
		},
		{ projection: { _id: 0, flags: 1 } },
	);

	return addStopCodesToTripPath(path, stopDocs);
}
