/* * */

import { type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';

/* * */

type TripDirectionReference = Pick<GtfsStrictV30Trips, 'route_id' | 'shape_id' | 'trip_headsign'>;

/** Keeps the first exported trip as the direction reference for each route. */
export class TripDirectionRegistry {
	private references = new Map<string, TripDirectionReference>();

	resolve(trip: TripDirectionReference): GtfsStrictV30Trips['direction_id'] {
		const reference = this.references.get(trip.route_id);

		if (!reference) {
			this.references.set(trip.route_id, { ...trip });
			return '0';
		}

		return trip.trip_headsign !== reference.trip_headsign && trip.shape_id !== reference.shape_id ? '1' : '0';
	}
}
