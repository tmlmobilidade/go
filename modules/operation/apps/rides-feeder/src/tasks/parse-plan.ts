/* * */

import { toMetersFromKilometersOrMeters } from '@tmlmobilidade/geo';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { GeoJsonLineStringGeometrySchema } from '@tmlmobilidade/go-types-geo';
import { CreateHashedShapeSchema, type CreateHashedTrip, CreateHashedTripSchema, type HashedShape, HashedShapeSchema, type HashedTrip, HashedTripSchema, type Plan, type Ride } from '@tmlmobilidade/go-types-operation';
import { HexColorSchema, NonNegativeIntegerSchema, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { fromGeoJsonLineStringToEncodedPolyline } from '@tmlmobilidade/go-utils-geo';
import { type ImportGtfsConfig, importGtfsStrictV30ToDatabase } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { fromOperationalTimeAndOperationalDateToUnixMilliseconds } from '@tmlmobilidade/utils';
import crypto from 'crypto';

import { cleanupOrphanRidesForPlan } from '../utils/cleanup.js';
import { startPlanHeartbeat } from '../utils/heartbeat.js';
import { setPlanStatus } from '../utils/set-plan-status.js';

/* * */

const ridesWritter = new BatchWriter<Ride>({
	batch_size: 10_000,
	insertFn: async (data) => {
		await labDb.operation.rides.insert('JSONEachRow', data);
	},
	title: await labDb.operation.rides.getTableName(),
});

const hashedShapesWritter = new BatchWriter<HashedShape>({
	batch_size: 2_000,
	insertFn: async (data) => {
		await labDb.operation.hashedShapes.insert('JSONEachRow', data);
	},
	title: await labDb.operation.hashedShapes.getTableName(),
});

const hashedTripsWritter = new BatchWriter<HashedTrip>({
	batch_size: 10_000,
	insertFn: async (data) => {
		await labDb.operation.hashedTrips.insert('JSONEachRow', data);
	},
	title: await labDb.operation.hashedTrips.getTableName(),
});

/* * */

export async function parsePlanTask(planData: Plan) {
	//

	const globalTimer = new Timer();

	Logger.spacer(1);
	Logger.divider(`Agency ${planData.agency_id} - Plan ${planData._id}`);

	//
	// Mark the plan as 'error' if it does not have an associated operation file

	if (!planData.operation_file_id) {
		console.error(`Skip processing: No operation file found. (plan: ${planData._id})`);
		await setPlanStatus(planData._id, 'error');
		return;
	}

	//
	// Start a heartbeat to indicate the plan is still being processed.

	const heartbeat = startPlanHeartbeat(planData._id);

	Logger.success(`Processing started: feed_start_date: ${planData.gtfs_feed_info.feed_start_date} | feed_end_date: ${planData.gtfs_feed_info.feed_end_date}`);
	Logger.spacer(1);

	//
	// Setup variables to save formatted entities found in this Plan

	const savedRideIds = new Set<string>();
	const savedHashedTripIds = new Set<string>();
	const savedHashedShapeIds = new Set<string>();

	//
	// Import the GTFS into SQLite using the helper package

	const importTimer = new Timer();

	const operationFileUrl = await storageProvider.getSignedUrl({ fileId: planData.operation_file_id });

	const importConfig: ImportGtfsConfig = {
		source: {
			url: operationFileUrl,
		},
		sqlite_config: {
			memory: true,
		},
		time_range: {
			date_range: {
				end: planData.gtfs_feed_info.feed_end_date,
				start: planData.gtfs_feed_info.feed_start_date,
			},
		},
	};

	const importedGtfsSql = await importGtfsStrictV30ToDatabase(importConfig);

	Logger.success(`Imported Plan ${planData._id} in ${importTimer.get()}.`);

	/* * */
	/* OUTPUT FILES */

	try {
		//

		const outputsTimer = new Timer();

		Logger.title(`Generating Rides and HashedTrips...`);

		Logger.info({ message: `calendar_dates: ${Object.values(importedGtfsSql.calendar_dates).flat().length} days for ${Object.keys(importedGtfsSql.calendar_dates).length} service IDs` });
		Logger.info({ message: `trips: ${importedGtfsSql.trips.size} rows` });
		Logger.info({ message: `routes: ${importedGtfsSql.routes.size} rows` });
		Logger.info({ message: `shapes: ${importedGtfsSql.shapes.size} rows` });
		Logger.info({ message: `stops: ${importedGtfsSql.stops.size} rows` });
		Logger.info({ message: `stop_times: ${importedGtfsSql.stop_times.size} rows` });

		let tripsCounter = importedGtfsSql.trips.size;
		let stopTimesCounter = importedGtfsSql.stop_times.size;

		for (const currentTrip of importedGtfsSql.trips.all()) {
			//

			//
			// Log every 10_000 rides processed

			if (tripsCounter % 10_000 === 0) Logger.title(`${tripsCounter} trips left. ${stopTimesCounter} stop_times left. Generated ${savedRideIds.size} Rides so far. `);

			//
			// Get associated data from previously saved entities,
			// as well as other commonly used variables in the next steps.

			const calendarDatesData = importedGtfsSql.calendar_dates[currentTrip.service_id];
			const routeData = importedGtfsSql.routes.get('route_id', currentTrip.route_id);
			const shapeData = importedGtfsSql.shapes.all('WHERE shape_id = ?', [currentTrip.shape_id]);
			const stopTimesData = importedGtfsSql.stop_times.all('WHERE trip_id = ? ORDER BY stop_sequence ASC', [currentTrip.trip_id]);

			//
			// Validate the required data for this trip
			// to prevent errors later on.

			if (!calendarDatesData || calendarDatesData.length === 0) {
				Logger.error({ message: `Trip "${currentTrip.trip_id}" has no calendar dates. Skipping...` });
				continue;
			}

			if (!routeData) {
				Logger.error({ message: `Trip "${currentTrip.trip_id}" has no route data. Skipping...` });
				continue;
			}

			if (!shapeData || shapeData.length === 0) {
				Logger.error({ message: `Trip "${currentTrip.trip_id}" has no shape data. Skipping...` });
				continue;
			}

			if (!stopTimesData || stopTimesData.length === 0) {
				Logger.error({ message: `Trip "${currentTrip.trip_id}" has no stop_times data. Skipping...` });
				continue;
			}

			/* * */
			/* HASHED SHAPE */

			//
			// Transform the GTFS shape data into a GeoJSON LineString,
			// and then encode it as a polyline string.

			const sortedShapeData = shapeData.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);

			const shapeAsGeoJsonGeometry = GeoJsonLineStringGeometrySchema.parse({
				coordinates: sortedShapeData.map(point => [point.shape_pt_lon, point.shape_pt_lat]),
				type: 'LineString',
			});

			const shapeAsEncodedPolyline = fromGeoJsonLineStringToEncodedPolyline(shapeAsGeoJsonGeometry);

			//
			// Calculate the extension in meters for the shape.

			const firstShapePoint = sortedShapeData[0];
			const lastShapePoint = sortedShapeData[sortedShapeData.length - 1];

			const extensionScheduledInMeters = Math.round(toMetersFromKilometersOrMeters(lastShapePoint.shape_dist_traveled, firstShapePoint.shape_dist_traveled));

			//
			// Hash the object contents and check if it already exists in the database.
			// The hash value is the _id of the HashedTrip item.

			const createHashedShape = CreateHashedShapeSchema.parse({
				agency_id: planData.agency_id,
				extension: extensionScheduledInMeters,
				shape_id: currentTrip.shape_id,
				shape_polyline: shapeAsEncodedPolyline,
			});

			const uniqueIdValueForHashedShape = crypto
				.createHash('sha256')
				.update(JSON.stringify(createHashedShape))
				.digest('hex');

			const currentHashedShapeAlreadyExists = await labDb.queryFromString('SELECT 1 FROM operation.hashed_shapes WHERE _id = $1 LIMIT 1', { 1: uniqueIdValueForHashedShape });

			const hashedShapeItem = HashedShapeSchema.parse({
				...createHashedShape,
				_id: uniqueIdValueForHashedShape,
				updated_at: Dates.now('utc').unix_milliseconds,
			});

			if (!currentHashedShapeAlreadyExists) {
				await hashedShapesWritter.write(hashedShapeItem);
				savedHashedShapeIds.add(uniqueIdValueForHashedShape);
			}

			/* * */
			/* HASHED TRIP */

			//
			// Extract commonly used variables to avoid
			// repeated lookups and calculations.

			const sortedStopTimesData = stopTimesData?.sort((a, b) => a.stop_sequence - b.stop_sequence);

			const firstStopTime = sortedStopTimesData[0];
			const lastStopTime = sortedStopTimesData[sortedStopTimesData.length - 1];

			//
			// Build the HashedTrip data, including formatting the path data by combining
			// properties from stop_times and stops. Sort it by stop_sequence to ensure
			// the order is stable for hashing.

			const formattedCreateHashedTripItems: CreateHashedTrip[] = [];

			for (const stopTime of sortedStopTimesData) {
				// Get the corresponding stop data for this stop_time
				const stopData = importedGtfsSql.stops.get('stop_id', stopTime.stop_id);
				if (!stopData) throw new Error(`Stop "${stopTime.stop_id}" not found for trip "${currentTrip.trip_id}" for Plan "${planData._id}".`);
				// Normalize the shape_dist_traveled to meters, if necessary
				const normalizedShapeDistTraveled = toMetersFromKilometersOrMeters(stopTime.shape_dist_traveled, lastStopTime.shape_dist_traveled);
				// Validate this stop_time in the schema
				const validatedCreateHashedTripItem = CreateHashedTripSchema.parse({
					agency_id: planData.agency_id,
					arrival_time: stopTime.arrival_time,
					departure_time: stopTime.departure_time,
					drop_off_type: stopTime.drop_off_type,
					pickup_type: stopTime.pickup_type,
					shape_dist_traveled: normalizedShapeDistTraveled,
					shape_id: currentTrip.shape_id,
					stop_id: stopTime.stop_id,
					stop_lat: stopData.stop_lat,
					stop_lon: stopData.stop_lon,
					stop_name: stopData.stop_name,
					stop_sequence: stopTime.stop_sequence,
					timepoint: stopTime.timepoint === '1' ? true : false,
				});
				// Save the formatted path data for this stop_time
				formattedCreateHashedTripItems.push(validatedCreateHashedTripItem);
			}

			const sortedCreateHashedTripItems = formattedCreateHashedTripItems.sort((a, b) => {
				return a.stop_sequence - b.stop_sequence;
			});

			//
			// Hash the object contents and check if it already exists in the database.
			// The hash value is the _id of the HashedTrip item.

			const uniqueIdValueForHashedTrip = crypto
				.createHash('sha256')
				.update(JSON.stringify(sortedCreateHashedTripItems))
				.digest('hex');

			//
			// Check if there are rows with this unique ID value.
			// If there are no rows, save the HashedTrip items to the database.

			const currentHashedTripAlreadyExists = await labDb.queryFromString('SELECT 1 FROM operation.hashed_trips WHERE _id = $1 LIMIT 1', { 1: uniqueIdValueForHashedTrip });

			const hashedTripItems = sortedCreateHashedTripItems.map((item): HashedTrip => {
				return HashedTripSchema.parse({
					...item,
					_id: uniqueIdValueForHashedTrip,
					updated_at: Dates.now('utc').unix_milliseconds,
				});
			});

			if (!currentHashedTripAlreadyExists) {
				await hashedTripsWritter.write(hashedTripItems);
				savedHashedTripIds.add(uniqueIdValueForHashedTrip);
			}

			/* * */
			/* RIDES */

			//
			// Iterate on the saved calendar dates for this trip,
			// and create a Ride document for each date.

			for (const calendarDate of calendarDatesData) {
				//

				//
				// Setup the required variables for the Ride document.

				const uniqueIdValueForRide = `${planData._id}-${routeData.agency_id}-${calendarDate}-${currentTrip.trip_id}`;

				const startTimeScheduledString = firstStopTime.arrival_time;
				const startTimeScheduledUnixMilliseconds = fromOperationalTimeAndOperationalDateToUnixMilliseconds(startTimeScheduledString, calendarDate);

				const endTimeScheduledString = lastStopTime.arrival_time;
				const endTimeScheduledUnixMilliseconds = fromOperationalTimeAndOperationalDateToUnixMilliseconds(endTimeScheduledString, calendarDate);

				//
				// Build the final Ride objects

				const finalRide: Ride = {
					_id: uniqueIdValueForRide,
					agency_code: planData.gtfs_agency.agency_id,
					agency_id: planData.agency_id,
					apex_banking_taps_amount: null,
					apex_banking_taps_qty: null,
					apex_locations_qty: null,
					apex_refunds_amount: null,
					apex_refunds_qty: null,
					apex_sales_amount: null,
					apex_sales_qty: null,
					apex_validations_qty: null,
					direction_id: currentTrip.direction_id,
					driver_ids: [],
					end_time_observed: null,
					end_time_scheduled: endTimeScheduledUnixMilliseconds,
					extension_observed: null,
					extension_scheduled: NonNegativeIntegerSchema.parse(Math.round(extensionScheduledInMeters)),
					hashed_shape_id: uniqueIdValueForHashedShape,
					hashed_trip_id: uniqueIdValueForHashedTrip,
					headsign: currentTrip.trip_headsign,
					operational_date: OperationalDateIntSchema.parse(calendarDate),
					passengers_estimated: null,
					passengers_observed: null,
					passengers_observed_banking_taps_amount: null,
					passengers_observed_banking_taps_qty: null,
					passengers_observed_prepaid_amount: null,
					passengers_observed_prepaid_qty: null,
					passengers_observed_sales_amount: null,
					passengers_observed_sales_qty: null,
					passengers_observed_subscription_qty: null,
					plan_id: planData._id,
					processing_status: 'waiting',
					route_color: HexColorSchema.parse(routeData.route_color),
					route_id: routeData.route_id,
					route_long_name: routeData.route_long_name,
					route_short_name: routeData.route_short_name,
					route_text_color: HexColorSchema.parse(routeData.route_text_color),
					seen_first_at: null,
					seen_last_at: null,
					shape_id: currentTrip.shape_id,
					start_time_observed: null,
					start_time_scheduled: startTimeScheduledUnixMilliseconds,
					trip_id: currentTrip.trip_id,
					updated_at: Dates.now('utc').unix_milliseconds,
					vehicle_ids: [],
				};

				//
				// Save this Ride document to the database using the
				// BatchWriter, and store the ID for later reference.

				await ridesWritter.write(finalRide);

				savedRideIds.add(finalRide._id);

				//
			}

			//
			// Decrement the trips and stop times counters
			// to keep track of progress in the logs

			tripsCounter--;
			stopTimesCounter--;

			//
		}

		//
		// Flush the writers to save all the data to the database
		// before changing the Plan status to 'success'.

		await hashedShapesWritter.flush();
		await hashedTripsWritter.flush();
		await ridesWritter.flush();

		//
		// Cleanup the saved entities to avoid
		// storing so much data on disk.

		importedGtfsSql._db.cleanup();

		//
		// Log progress

		Logger.info({ message: `Saved ${savedRideIds.size} Rides and ${savedHashedTripIds.size} HashedTrips in ${outputsTimer.get()}.` });

		//
	} catch (error) {
		Logger.error({ error, message: `Error transforming or saving Shapes, Trips or Rides to database: ${error.message}` });
		throw new Error('✖︎ Error transforming or saving Shapes, Trips or Rides to database.', error);
	}

	//
	// Cleanup Rides that are no longer valid for this Plan.

	await cleanupOrphanRidesForPlan(planData._id, savedRideIds);

	//
	// Mark this plan as 'complete' to indicate that it was processed successfully

	heartbeat.stop();

	await setPlanStatus(planData._id, 'complete', planData.hash);

	Logger.success(`Finished processing plan "${planData._id}". (${globalTimer.get()})`);

	//
};
