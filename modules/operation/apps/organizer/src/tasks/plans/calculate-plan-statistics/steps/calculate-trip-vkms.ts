/* * */

import { GtfsShapesSchema } from '@tmlmobilidade/go-types-gtfs';
import { getDistanceBetweenPositions } from '@tmlmobilidade/go-utils-geo';
import { type GtfsSQLTables } from '@tmlmobilidade/go-utils-import-gtfs';

/* * */

export interface TripVkms {
	distance_km: number
	n_days: number
	service_id: string
	trip_id: string
	vkm: number
}

interface TripShape {
	service_id: string
	shape_id: null | string
	trip_id: string
}

interface ShapePoint {
	shape_pt_lat: null | number | string
	shape_pt_lon: null | number | string
}

const ShapeCoordinatesSchema = GtfsShapesSchema.pick({ shape_pt_lat: true, shape_pt_lon: true });

/* * */

/** Calculates VKM from shape geometry and calendar_dates within the inclusive YYYYMMDD range. */
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

	const trips = gtfs.trips.query<TripShape>('SELECT trip_id, service_id, shape_id FROM trips');
	const shapeDistances = new Map<string, number>();

	// Inner join: only retain trips with service dates in the requested range.
	return trips.flatMap((trip) => {
		const nDays = serviceDays.get(trip.service_id);
		if (!nDays) return [];

		if (!trip.shape_id) {
			throw new Error(`Cannot calculate VKMs: missing shape for trip "${trip.trip_id}".`);
		}

		let distanceKm = shapeDistances.get(trip.shape_id);

		if (distanceKm === undefined) {
			const points = gtfs.shapes.query<ShapePoint>(`
				SELECT shape_pt_lat, shape_pt_lon
				FROM shapes
				WHERE shape_id = ?
				ORDER BY CAST(shape_pt_sequence AS INTEGER)
			`, [trip.shape_id]);

			if (points.length < 2) {
				throw new Error(`Cannot calculate VKMs: insufficient geometry for shape "${trip.shape_id}" of trip "${trip.trip_id}".`);
			}

			const coordinates = points.map((point) => {
				const parsed = ShapeCoordinatesSchema.safeParse(point);
				if (!String(point.shape_pt_lat ?? '').trim() || !String(point.shape_pt_lon ?? '').trim() || !parsed.success) {
					throw new Error(`Cannot calculate VKMs: invalid coordinates for shape "${trip.shape_id}" of trip "${trip.trip_id}".`);
				}
				return parsed.data;
			});

			// Measure each shape once in meters, then cache its length in kilometers.
			let distanceMeters = 0;
			for (let index = 1; index < coordinates.length; index++) {
				const previous = coordinates[index - 1];
				const current = coordinates[index];
				distanceMeters += getDistanceBetweenPositions(
					[previous.shape_pt_lon, previous.shape_pt_lat],
					[current.shape_pt_lon, current.shape_pt_lat],
				);
			}

			distanceKm = distanceMeters / 1000;
			shapeDistances.set(trip.shape_id, distanceKm);
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
