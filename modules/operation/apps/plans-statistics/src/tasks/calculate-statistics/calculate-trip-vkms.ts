/* * */

import { type GtfsSQLTables } from '@tmlmobilidade/go-utils-import-gtfs';

/* * */

export interface TripVkms {
	distance_km: number
	n_days: number
	service_id: string
	trip_id: string
	vkm: number
}

interface TripDistance {
	distance_km: null | string
	service_id: string
	trip_id: string
}

/* * */

/** Calculates VKM per trip using calendar_dates within the inclusive YYYYMMDD range. */
export function calculateTripVkms(gtfs: GtfsSQLTables, startDate: number, endDate: number): TripVkms[] {
	if (!gtfs.trips || !gtfs.shapes || !gtfs.calendar_dates) {
		throw new Error('Cannot calculate VKMs: trips, shapes or calendar dates are missing.');
	}

	if (startDate > endDate) {
		throw new Error('Cannot calculate VKMs: the start date must not be after the end date.');
	}

	// Count service dates in the requested range. The importer already removes duplicate dates.
	const serviceDays = new Map(
		Object.entries(gtfs.calendar_dates).map(([serviceId, dates]) => [
			serviceId,
			dates.filter(date => date >= startDate && date <= endDate).length,
		]),
	);

	// Shape distances are cumulative kilometers; the last point gives the trip distance.
	const tripsDist = gtfs.trips.query<TripDistance>(`
		SELECT t.trip_id, t.service_id, (
			SELECT s.shape_dist_traveled
			FROM shapes s
			WHERE s.shape_id = t.shape_id
			ORDER BY CAST(s.shape_pt_sequence AS INTEGER) DESC
			LIMIT 1
		) AS distance_km
		FROM trips t
	`);

	// Inner join: only retain trips with service dates in the requested range.
	return tripsDist.flatMap((trip) => {
		const nDays = serviceDays.get(trip.service_id);
		if (!nDays) return [];

		const distanceKm = Number(trip.distance_km);
		if (!trip.distance_km?.trim() || !Number.isFinite(distanceKm) || distanceKm < 0) {
			throw new Error(`Cannot calculate VKMs: invalid shape distance for trip "${trip.trip_id}".`);
		}

		return [{
			distance_km: distanceKm,
			n_days: nDays,
			service_id: trip.service_id,
			trip_id: trip.trip_id,
			vkm: distanceKm * nDays,
		}];
	});
}
