/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import AdmZip from 'adm-zip';
import Papa from 'papaparse';

/* * */

interface GtfsRawRoute {
	[key: string]: string
	route_id: string
}

interface GtfsRawTrip {
	[key: string]: string
	direction_id: string
	route_id: string
	shape_id: string
	trip_headsign: string
	trip_id: string
}

interface GtfsRawStopTime {
	[key: string]: string
	arrival_time: string
	departure_time: string
	shape_dist_traveled: string
	stop_id: string
	stop_sequence: string
	trip_id: string
}

interface GtfsRawShape {
	[key: string]: string
	shape_dist_traveled: string
	shape_id: string
	shape_pt_lat: string
	shape_pt_lon: string
	shape_pt_sequence: string
}

interface GtfsRoute {
	route_id: string
	trips: GtfsTrip[]
}

interface GtfsTrip {
	direction_id: string
	path: {
		arrival_time: string
		departure_time: string
		shape_dist_traveled: number
		stop_id: string
		stop_sequence: number
	}[]
	route_id: string
	shape: {
		points: {
			shape_dist_traveled: number
			shape_pt_lat: number
			shape_pt_lon: number
			shape_pt_sequence: number
		}[]
		shape_id: string
	}
	shape_id: string
	trip_headsign: string
	trip_id: string
}

type ParsedStopTime = GtfsTrip['path'][number];
type ParsedShapePoint = GtfsTrip['shape']['points'][number];

/**
 * Parses a GTFS CSV file from a zip entry.
 */
function parseCsvFile<T>(content: string): T[] {
	const result = Papa.parse<T>(content, {
		dynamicTyping: false,
		header: true,
		skipEmptyLines: true,
	});

	return result.data;
}

/**
 * Converts distance to meters if the dataset seems to be in km.
 */
function normalizeDistancesToMetersIfNeeded(
	points: ParsedShapePoint[],
	path: ParsedStopTime[],
): { path: ParsedStopTime[], points: ParsedShapePoint[] } {
	const lastShapePoint = points[points.length - 1];
	const appearsToBeKm = lastShapePoint && lastShapePoint.shape_dist_traveled < 1000;

	if (!appearsToBeKm) {
		return { path, points };
	}

	return {
		path: path.map(item => ({
			...item,
			shape_dist_traveled: item.shape_dist_traveled * 1000,
		})),
		points: points.map(item => ({
			...item,
			shape_dist_traveled: item.shape_dist_traveled * 1000,
		})),
	};
}

/* * */

export class GtfsController {
	//

	/**
	 * Parse GTFS ZIP file and return structured data
	 * @param request Fastify request containing multipart form data with GTFS ZIP file
	 * @param reply Fastify reply
	 */
	static async parse(request: FastifyRequest, reply: FastifyReply<GtfsRoute[]>) {
		//

		try {
			// Get the uploaded file from multipart data
			const data = await request.file();

			if (!data) {
				throw new Error('No file uploaded');
			}

			// Convert file buffer to Buffer
			const buffer = await data.toBuffer();

			// Setup AdmZip with buffer
			const zipArchive = new AdmZip(buffer);
			const zipEntries = zipArchive.getEntries();

			let gtfsRoutes: GtfsRawRoute[] = [];
			let gtfsTripsRaw: GtfsRawTrip[] = [];
			let gtfsStopTimesRaw: GtfsRawStopTime[] = [];
			let gtfsShapesRaw: GtfsRawShape[] = [];

			for (const zipEntry of zipEntries) {
				const content = zipEntry.getData().toString('utf8');

				if (zipEntry.entryName === 'routes.txt') {
					gtfsRoutes = parseCsvFile<GtfsRawRoute>(content);
				}

				if (zipEntry.entryName === 'trips.txt') {
					gtfsTripsRaw = parseCsvFile<GtfsRawTrip>(content);
				}

				if (zipEntry.entryName === 'stop_times.txt') {
					gtfsStopTimesRaw = parseCsvFile<GtfsRawStopTime>(content);
				}

				if (zipEntry.entryName === 'shapes.txt') {
					gtfsShapesRaw = parseCsvFile<GtfsRawShape>(content);
				}
			}

			const dedupedTripsMap = new Map<string, GtfsRawTrip>();
			for (const trip of gtfsTripsRaw) {
				const key = `${trip.route_id}__${trip.direction_id}__${trip.shape_id}`;
				if (!dedupedTripsMap.has(key)) {
					dedupedTripsMap.set(key, trip);
				}
			}
			const gtfsTrips = Array.from(dedupedTripsMap.values());

			const stopTimesByTripId = new Map<string, ParsedStopTime[]>();

			for (let i = 0; i < gtfsStopTimesRaw.length; i++) {
				const stopTime = gtfsStopTimesRaw[i];
				const tripId = stopTime.trip_id;

				const parsedStopTime: ParsedStopTime = {
					arrival_time: stopTime.arrival_time,
					departure_time: stopTime.departure_time,
					shape_dist_traveled: Number.parseFloat(stopTime.shape_dist_traveled),
					stop_id: stopTime.stop_id,
					stop_sequence: Number.parseInt(stopTime.stop_sequence),
				};

				const existing = stopTimesByTripId.get(tripId);
				if (existing) {
					existing.push(parsedStopTime);
				} else {
					stopTimesByTripId.set(tripId, [parsedStopTime]);
				}
			}

			for (const path of stopTimesByTripId.values()) {
				path.sort((a, b) => a.stop_sequence - b.stop_sequence);
			}

			const shapesById = new Map<string, { points: ParsedShapePoint[], shape_id: string }>();

			for (const shapeRow of gtfsShapesRaw) {
				const shapeId = shapeRow.shape_id;

				const point: ParsedShapePoint = {
					shape_dist_traveled: Number.parseFloat(shapeRow.shape_dist_traveled),
					shape_pt_lat: Number.parseFloat(shapeRow.shape_pt_lat),
					shape_pt_lon: Number.parseFloat(shapeRow.shape_pt_lon),
					shape_pt_sequence: Number.parseInt(shapeRow.shape_pt_sequence),
				};

				const existing = shapesById.get(shapeId);
				if (existing) {
					existing.points.push(point);
				} else {
					shapesById.set(shapeId, {
						points: [point],
						shape_id: shapeId,
					});
				}
			}

			for (const shape of shapesById.values()) {
				shape.points.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
			}

			const tripsByRouteId = new Map<string, GtfsRawTrip[]>();
			for (const trip of gtfsTrips) {
				const existing = tripsByRouteId.get(trip.route_id);
				if (existing) {
					existing.push(trip);
				} else {
					tripsByRouteId.set(trip.route_id, [trip]);
				}
			}

			const gtfsFinal: GtfsRoute[] = gtfsRoutes.map((route) => {
				const routeTrips = tripsByRouteId.get(route.route_id) || [];

				const trips: GtfsTrip[] = routeTrips.flatMap((trip) => {
					const shape = shapesById.get(trip.shape_id);
					const path = stopTimesByTripId.get(trip.trip_id);

					if (!shape || !path) return [];

					const normalized = normalizeDistancesToMetersIfNeeded(
						shape.points,
						path,
					);

					return [{
						...trip,
						path: normalized.path,
						shape: {
							points: normalized.points,
							shape_id: shape.shape_id,
						},
					}];
				});

				return {
					route_id: route.route_id,
					trips,
				};
			});

			return reply.send({
				data: gtfsFinal,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			console.log(error);

			return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
				data: null,
				error: error instanceof Error ? error.message : 'Failed to parse GTFS file',
				statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			});
		}

		//
	}

	//
}
