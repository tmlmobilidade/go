/* * */

import { GtfsShapesSchema } from '@tmlmobilidade/go-types-gtfs';
import { type GtfsSQLTables } from '@tmlmobilidade/go-utils-import-gtfs';
import { distance } from '@turf/distance';

/* * */

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

/** Calculates total VKM from shape geometry and service dates within the inclusive YYYYMMDD range. */
export function calculateTotalVkms(gtfs: GtfsSQLTables, startDate: number, endDate: number): number {
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
	let totalVkms = 0;

	for (const trip of trips) {
		const nDays = serviceDays.get(trip.service_id);
		if (!nDays) continue;

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

			distanceKm = 0;
			for (let index = 1; index < coordinates.length; index++) {
				const previous = coordinates[index - 1];
				const current = coordinates[index];
				distanceKm += distance(
					[previous.shape_pt_lon, previous.shape_pt_lat],
					[current.shape_pt_lon, current.shape_pt_lat],
					{ units: 'kilometers' },
				);
			}

			shapeDistances.set(trip.shape_id, distanceKm);
		}

		totalVkms += distanceKm * nDays;
	}

	return totalVkms;
}
