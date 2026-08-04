/* * */

import { cleanupOrphanRidesForPlan } from '@/cleanup.js';
import { Dates } from '@tmlmobilidade/dates';
import { encodePolylineFromGeoJson, toMetersFromKilometersOrMeters } from '@tmlmobilidade/geo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { GeoJsonLineStringGeometrySchema } from '@tmlmobilidade/go-types-geo';
import { CreateHashedTrip, CreateHashedTripSchema, type HashedTrip, HashedTripSchema, type Ride } from '@tmlmobilidade/go-types-operation';
import { validateHexColor, validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { type ImportGtfsConfig, importGtfsToDatabase } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type Plan } from '@tmlmobilidade/types';
import { BatchWriter, fromGtfsTimeAndGtfsDateToUnixTimestamp } from '@tmlmobilidade/utils';
import crypto from 'crypto';

/* * */

export async function parsePlan(planData: Plan) {
	//

	const globalTimer = new Timer();

	//
	// Setup variables to save formatted entities found in this Plan

	const savedRideIds = new Set<string>();
	const savedHashedTripIds = new Set<string>();

	//
	// Setup database writers

	const ridesWritter = new BatchWriter<Ride>({
		batch_size: 10_000,
		insertFn: async (data) => {
			await labDb.operation.rides.insert('JSONEachRow', data);
		},
		title: await labDb.operation.rides.getTableName(),
	});

	const hashedPathsWritter = new BatchWriter<HashedTrip>({
		batch_size: 10_000,
		insertFn: async (data) => {
			await labDb.operation.hashedPaths.insert('JSONEachRow', data);
		},
		title: await labDb.operation.hashedPaths.getTableName(),
	});

	//
	// Import the GTFS into SQLite using the helper package

	const importTimer = new Timer();

	const operationFileUrl = await storageProvider.getSignedUrl({ fileId: planData.operation_file_id });

	const importConfig: ImportGtfsConfig = {
		source: {
			url: operationFileUrl,
		},
		time_range: {
			date_range: {
				end: planData.gtfs_feed_info.feed_end_date,
				start: planData.gtfs_feed_info.feed_start_date,
			},
		},
	};

	const importedGtfsSql = await importGtfsToDatabase(importConfig);

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

			//
			// Extract commonly used variables to avoid
			// repeated lookups and calculations.

			const sortedStopTimesData = stopTimesData?.sort((a, b) => a.stop_sequence - b.stop_sequence);

			const lastStopTime = sortedStopTimesData[sortedStopTimesData.length - 1];

			/* * */
			/* HASHED PATH */

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
					drop_off_type: stopTime.drop_off_type,
					pickup_type: stopTime.pickup_type,
					shape_dist_traveled: normalizedShapeDistTraveled,
					stop_id: stopTime.stop_id,
					stop_lat: stopData.stop_lat,
					stop_lon: stopData.stop_lon,
					stop_name: stopData.stop_name,
					stop_sequence: stopTime.stop_sequence,
					timepoint: stopTime.timepoint,
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

			const uniqueIdValueForCreateHashedTrip = crypto
				.createHash('sha256')
				.update(JSON.stringify(sortedCreateHashedTripItems))
				.digest('hex');

			//
			// Check if there are rows with this unique ID value.
			// If there are no rows, save the HashedTrip items to the database.

			const currentHashedTripAlreadyExists = await labDb.operation.hashedPaths.count('DISTINCT(_id)', 'WHERE _id = $1', { 1: uniqueIdValueForCreateHashedTrip }) > 0;

			const hashedPathItems = sortedCreateHashedTripItems.map((item): HashedTrip => {
				return HashedTripSchema.parse({
					...item,
					_id: uniqueIdValueForCreateHashedTrip,
					updated_at: Dates.now('utc').unix_timestamp,
				});
			});

			if (!currentHashedTripAlreadyExists) {
				await hashedPathsWritter.write(hashedPathItems);
				savedHashedTripIds.add(uniqueIdValueForCreateHashedTrip);
			}

			/* * */
			/* SHAPE TO ENCODED POLYLINE */

			//
			// Transform the GTFS shape data into a GeoJSON LineString,
			// and then encode it as a polyline string.

			const shapeAsGeoJsonGeometry = GeoJsonLineStringGeometrySchema.parse({
				coordinates: shapeData.map(point => [point.shape_pt_lon, point.shape_pt_lat]),
				type: 'LineString',
			});

			const shapeAsEncodedPolyline = encodePolylineFromGeoJson(shapeAsGeoJsonGeometry);

			/* * */
			/* RIDES */

			//
			// Setup variable that will be used multiple times in the next steps.

			const firstWaypoint = sortedCreateHashedTripItems[0];
			const lastWaypoint = sortedCreateHashedTripItems[sortedCreateHashedTripItems.length - 1];

			const extensionScheduledInMeters = toMetersFromKilometersOrMeters(lastWaypoint.shape_dist_traveled, lastWaypoint.shape_dist_traveled);

			//
			// Iterate on the saved calendar dates for this trip,
			// and create a Ride document for each date.

			for (const calendarDate of calendarDatesData) {
				//

				//
				// Setup the required variables for the Ride document.

				const uniqueIdValueForRide = `${planData._id}-${routeData.agency_id}-${calendarDate}-${currentTrip.trip_id}`;

				const startTimeScheduledString = firstWaypoint.arrival_time;
				const startTimeScheduledUnixTimestamp = fromGtfsTimeAndGtfsDateToUnixTimestamp(startTimeScheduledString, calendarDate);

				const endTimeScheduledString = lastWaypoint.arrival_time;
				const endTimeScheduledUnixTimestamp = fromGtfsTimeAndGtfsDateToUnixTimestamp(endTimeScheduledString, calendarDate);

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
					end_time_scheduled: endTimeScheduledUnixTimestamp,
					extension_observed: null,
					extension_scheduled: extensionScheduledInMeters,
					hashed_trip_id: uniqueIdValueForCreateHashedTrip,
					headsign: currentTrip.trip_headsign,
					operational_date: validateOperationalDateInt(calendarDate),
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
					route_color: validateHexColor(routeData.route_color),
					route_id: routeData.route_id,
					route_long_name: routeData.route_long_name,
					route_short_name: routeData.route_short_name,
					route_text_color: validateHexColor(routeData.route_text_color),
					seen_first_at: null,
					seen_last_at: null,
					shape_id: currentTrip.shape_id,
					shape_polyline: shapeAsEncodedPolyline,
					start_time_observed: null,
					start_time_scheduled: startTimeScheduledUnixTimestamp,
					trip_id: currentTrip.trip_id,
					updated_at: Dates.now('utc').unix_timestamp,
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

		await hashedPathsWritter.flush();
		await ridesWritter.flush();

		//
		// Cleanup the saved entities to avoid
		// storing so much data on disk.

		importedGtfsSql._db.close();

		//
		// Log progress

		Logger.info({ message: `Saved ${savedRideIds.size} Rides and ${savedHashedTripIds.size} HashedTrips in ${outputsTimer.get()}.` });

		//
	} catch (error) {
		Logger.error({ error, message: 'Error transforming or saving Shapes, Trips or Rides to database.' });
		throw new Error('✖︎ Error transforming or saving Shapes, Trips or Rides to database.', error);
	}

	//
	// Cleanup Rides that are no longer valid for this Plan.

	await cleanupOrphanRidesForPlan(planData._id, savedRideIds);

	//
	// Mark this plan as 'complete' to indicate that it was processed successfully

	const plansCollection = await goDb.operation.plans.getCollection();

	await plansCollection.updateOne({ _id: { $eq: planData._id } }, { $set: { 'apps.controller.last_hash': planData.hash, 'apps.controller.status': 'complete', 'apps.controller.timestamp': Dates.now('Europe/Lisbon').unix_timestamp } });

	Logger.success(`Finished processing plan "${planData._id}". (${globalTimer.get()})`);

	//
	// When a plan is successfully processed, the program must be restarted
	// to retrieve the latest data. This is because plans take a long time to process,
	// and in the meantime users may have changed status and updated files.

	Logger.divider('Restarting to fetch latest plan data...');

	process.exit(0);

	//
};
