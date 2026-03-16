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
			let gtfsTrips: GtfsRawTrip[] = [];
			const gtfsStopTimes: { path: { arrival_time: string, departure_time: string, shape_dist_traveled: number, stop_id: string, stop_sequence: number }[], trip_id: string }[] = [];
			const gtfsShapes: { points: { shape_dist_traveled: number, shape_pt_lat: number, shape_pt_lon: number, shape_pt_sequence: number }[], shape_id: string }[] = [];

			// Parse each file in the ZIP
			for (const zipEntry of zipEntries) {
				//
				if (zipEntry.entryName === 'routes.txt') {
					const jsonData = Papa.parse(zipEntry.getData().toString('utf8'), {
						dynamicTyping: false,
						header: true,
						skipEmptyLines: true,
					});
					gtfsRoutes = jsonData.data as GtfsRawRoute[];
				}

				if (zipEntry.entryName === 'trips.txt') {
					const jsonData = Papa.parse(zipEntry.getData().toString('utf8'), {
						dynamicTyping: false,
						header: true,
						skipEmptyLines: true,
					});
					// Dedupe trips by route_id, direction_id, and shape_id
					const jsonDataDeduped = (jsonData.data as GtfsRawTrip[]).filter((arr, index, self) =>
						index === self.findIndex(t =>
							t.route_id === arr.route_id
							&& t.direction_id === arr.direction_id
							&& t.shape_id === arr.shape_id,
						),
					);
					gtfsTrips = jsonDataDeduped;
				}

				if (zipEntry.entryName === 'stop_times.txt') {
					const jsonData = Papa.parse(zipEntry.getData().toString('utf8'), {
						dynamicTyping: false,
						header: true,
						skipEmptyLines: true,
					});
					(jsonData.data as GtfsRawStopTime[]).forEach((stopTimesData) => {
						const tripId = stopTimesData.trip_id;
						const pathSequence = {
							arrival_time: stopTimesData.arrival_time,
							departure_time: stopTimesData.departure_time,
							shape_dist_traveled: Number.parseFloat(stopTimesData.shape_dist_traveled),
							stop_id: stopTimesData.stop_id,
							stop_sequence: Number.parseInt(stopTimesData.stop_sequence),
						};

						const existingStopTime = gtfsStopTimes.find(stopTimes => stopTimes.trip_id === tripId);

						if (existingStopTime) {
							existingStopTime.path.push(pathSequence);
						}
						else {
							gtfsStopTimes.push({
								path: [pathSequence],
								trip_id: tripId,
							});
						}
					});
				}

				if (zipEntry.entryName === 'shapes.txt') {
					const jsonData = Papa.parse(zipEntry.getData().toString('utf8'), {
						dynamicTyping: false,
						header: true,
						skipEmptyLines: true,
					});
					(jsonData.data as GtfsRawShape[]).forEach((shapeData) => {
						const shapeId = shapeData.shape_id;
						const point = {
							shape_dist_traveled: Number.parseFloat(shapeData.shape_dist_traveled),
							shape_pt_lat: Number.parseFloat(shapeData.shape_pt_lat),
							shape_pt_lon: Number.parseFloat(shapeData.shape_pt_lon),
							shape_pt_sequence: Number.parseInt(shapeData.shape_pt_sequence),
						};

						const existingShape = gtfsShapes.find(shape => shape.shape_id === shapeId);

						if (existingShape) {
							existingShape.points.push(point);
						}
						else {
							gtfsShapes.push({
								points: [point],
								shape_id: shapeId,
							});
						}
					});
				}
			}

			const gtfsFinal: GtfsRoute[] = [];

			// Loop through each route
			for (const route of gtfsRoutes) {
				const trips: GtfsTrip[] = [];

				// Find all trips associated with the current route
				for (const trip of gtfsTrips) {
					if (trip.route_id === route.route_id) {
						// Find the shape associated with the trip
						const shape = gtfsShapes.find(s => s.shape_id === trip.shape_id);
						if (!shape) continue;

						// Sort the shape points
						shape.points = shape.points.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);

						// Find the path associated with the trip
						const stopTime = gtfsStopTimes.find(st => st.trip_id === trip.trip_id);
						if (!stopTime) continue;

						// Convert the shapes into meters, if they are in km (by checking the last point of the shape)
						const lastShapePoint = shape.points[shape.points.length - 1];
						if (lastShapePoint && lastShapePoint.shape_dist_traveled < 1000) {
							shape.points = shape.points.map(point => ({
								...point,
								shape_dist_traveled: point.shape_dist_traveled * 1000,
							}));
							stopTime.path = stopTime.path.map(st => ({
								...st,
								shape_dist_traveled: st.shape_dist_traveled * 1000,
							}));
						}

						// Create a new trip object with shape information
						const tripWithShape: GtfsTrip = {
							...trip,
							path: stopTime.path,
							shape: shape,
						};
						trips.push(tripWithShape);
					}
				}

				// Create an object with the route information and associated trips
				const routeWithTrips: GtfsRoute = {
					...route,
					trips: trips,
				};

				gtfsFinal.push(routeWithTrips);
			}

			return reply.send({
				data: gtfsFinal,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		}
		catch (error) {
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
