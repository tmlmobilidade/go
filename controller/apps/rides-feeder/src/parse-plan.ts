/* * */

import { cleanupOrphanRidesForPlan } from '@/cleanup.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { MongoDbWriter, type MongoDbWriterWriteOptions } from '@helperkits/writer';
import { files, hashedShapes, hashedTrips, plans, rides } from '@tmlmobilidade/interfaces';
import { type GTFS_Calendar_Raw, type GTFS_CalendarDate_Raw, type GTFS_Route_Extended, type GTFS_Route_Extended_Raw, type GTFS_Shape, type GTFS_Shape_Raw, type GTFS_Stop_Extended, type GTFS_Stop_Extended_Raw, type GTFS_StopTime, type GTFS_StopTime_Raw, type GTFS_Trip_Extended, type GTFS_Trip_Extended_Raw, type HashedShape, type HashedShapePoint, type HashedTrip, type HashedTripWaypoint, type OperationalDate, type Plan, type Ride, type UnixTimestamp, validateGtfsCalendar, validateGtfsCalendarDate, validateGtfsRouteExtended, validateGtfsShape, validateGtfsStopExtended, validateGtfsStopTime, validateGtfsTripExtended } from '@tmlmobilidade/types';
import { convertMetersOrKilometersToMeters, Dates, getOperationalDatesFromRange } from '@tmlmobilidade/utils';
import crypto from 'crypto';
import { parse as csvParser } from 'csv-parse';
import extract from 'extract-zip';
import fs from 'fs';

/* * */

export async function parsePlan(planData: Plan) {
	try {
		//

		const globalTimer = new TIMETRACKER();

		//
		// Connect to databases and setup MongoDB Writers

		const hashedShapesCollection = await hashedShapes.getCollection();
		const hashedTripsCollection = await hashedTrips.getCollection();
		const ridesCollection = await rides.getCollection();

		const hashedShapesDbWritter = new MongoDbWriter<HashedShape>({ batch_size: 1000, collection: hashedShapesCollection });
		const hashedTripsDbWritter = new MongoDbWriter<HashedTrip>({ batch_size: 1000, collection: hashedTripsCollection });
		const ridesDbWritter = new MongoDbWriter<Ride>({ batch_size: 10000, collection: ridesCollection });

		//
		// Setup variables to save formatted entities found in this Plan

		const savedRideIds = new Set<string>();

		const referencedRouteIds = new Set<string>();
		const referencedShapeIds = new Set<string>();

		const savedCalendarDates = new Map<string, OperationalDate[]>();
		const savedTrips = new Map<string, GTFS_Trip_Extended>();
		const savedStops = new Map<string, GTFS_Stop_Extended>();
		const savedRoutes = new Map<string, Partial<GTFS_Route_Extended>>();
		const savedShapes = new Map<string, GTFS_Shape[]>();
		const savedStopTimes = new Map<string, GTFS_StopTime[]>();

		//
		// Prepare the working directories to work with the zip file
		// and the extracted files. Try to download and unzip the archive.

		const workdirPath = `/tmp/${planData._id}`;
		const downloadFilePath = `${workdirPath}/${planData.operation_file_id}.zip`;
		const extractDirPath = `${workdirPath}/extracted`;

		try {
			fs.rmSync(workdirPath, { force: true, recursive: true });
			fs.mkdirSync(workdirPath, { recursive: true });
			LOGGER.success('Prepared working directory.');
			LOGGER.spacer(1);
		}
		catch (error) {
			LOGGER.error(`Error preparing workdir path "${workdirPath}".`, error);
			process.exit(1);
		}

		//
		// Get the associated Operation GTFS archive URL,
		// and try to download, save and unzip it.

		const operationFileData = await files.findById(planData.operation_file_id);
		if (!operationFileData || !operationFileData.url) {
			LOGGER.error(`No operation file found for plan "${planData._id}".`);
			process.exit(1);
		}

		try {
			const downloadResponse = await fetch(operationFileData.url);
			const downloadArrayBuffer = await downloadResponse.arrayBuffer();
			fs.writeFileSync(downloadFilePath, Buffer.from(downloadArrayBuffer));
		}
		catch (error) {
			LOGGER.error('Error unzipping the file.', error);
			process.exit(1);
		}

		try {
			await unzipFile(downloadFilePath, extractDirPath);
			LOGGER.success(`Unzipped GTFS file from "${downloadFilePath}" to "${extractDirPath}".`);
			LOGGER.spacer(1);
		}
		catch (error) {
			LOGGER.error('Error unzipping the file.', error);
			process.exit(1);
		}

		//
		// The order of execution matters when parsing each .txt file.
		// This is because GTFS have a temporal validity. By first parsing calendar.txt
		// and then calendar_dates.txt, we know exactly which service_ids "were active"
		// between the start and end dates. Then, when parsing trips.txt, only trips
		// that belong to those service_ids will be included. And so on, for each file.
		// By having a list of trips we can extract only the necessary info from the other files,
		// and thus significantly reducing the amount of information to be checked.

		// --------------------------------------------------------------------------------------

		/* * */
		/* CALENDAR.TXT */

		//
		// Extract calendar.txt and filter only service_ids
		// that are valid between the given start_date and end_date.

		try {
			//

			LOGGER.info(`Reading zip entry "calendar.txt"...`);

			const parseEachRow = async (data: GTFS_Calendar_Raw) => {
				//

				//
				// Validate the current row against the proper type

				const validatedData = validateGtfsCalendar(data);

				//
				// Check if this service_id is between the given start_date and end_date.
				// Clip the service_id's start and end dates to the given start and end dates.

				let serviceIdStartDate = validatedData.start_date;
				let serviceIdEndDate = validatedData.end_date;

				if (serviceIdEndDate < planData.gtfs_feed_info.feed_start_date || serviceIdStartDate > planData.gtfs_feed_info.feed_end_date) return;

				if (serviceIdStartDate < planData.gtfs_feed_info.feed_start_date) serviceIdStartDate = planData.gtfs_feed_info.feed_start_date;
				if (serviceIdEndDate > planData.gtfs_feed_info.feed_end_date) serviceIdEndDate = planData.gtfs_feed_info.feed_end_date;

				//
				// If we're here, it means the service_id is valid between the given dates.
				// For the configured weekly schedule, create the individual operational dates
				// for each day of the week that is active.

				const allOperationalDatesInRange = getOperationalDatesFromRange(serviceIdStartDate, serviceIdEndDate);

				const validOperationalDates: OperationalDate[] = [];

				for (const currentDate of allOperationalDatesInRange) {
					const dayOfWeek = Dates.fromOperationalDate(currentDate, 'Europe/Lisbon').toFormat('c');
					if (dayOfWeek === '1' && validatedData.monday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '2' && validatedData.tuesday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '3' && validatedData.wednesday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '4' && validatedData.thursday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '5' && validatedData.friday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '6' && validatedData.saturday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '7' && validatedData.sunday === 1) validOperationalDates.push(currentDate);
				}

				//
				// Save the valid operational dates for this service_id

				savedCalendarDates.set(validatedData.service_id, validOperationalDates);

				//
			};

			//
			// Setup the CSV parsing operation only if the file exists

			if (fs.existsSync(`${extractDirPath}/calendar.txt`)) {
				await parseCsvFile(`${extractDirPath}/calendar.txt`, parseEachRow);
				LOGGER.success(`Finished processing "calendar.txt": ${savedCalendarDates.size} service_ids saved.`);
				LOGGER.spacer(1);
			}
			else {
				LOGGER.info(`Optional file "calendar.txt" not saved. This may or may not be an error. Proceeding...`);
				LOGGER.spacer(1);
			}

			//
		}
		catch (error) {
			LOGGER.error('Error processing "calendar.txt" file.', error);
			throw new Error('✖︎ Error processing "calendar.txt" file.');
		}

		/* * */
		/* CALENDAR_DATES.TXT */

		//
		// Extract calendar_dates.txt and either update the previously saved service_ids,
		// based on the configured exception_type, or create new service_ids that were not
		// present in calendar.txt and are between the given start and end dates.

		try {
			//

			LOGGER.info(`Reading zip entry "calendar_dates.txt"...`);

			const parseEachRow = async (data: GTFS_CalendarDate_Raw) => {
				//

				//
				// Validate the current row against the proper type

				const validatedData = validateGtfsCalendarDate(data);

				//
				// Skip if this row's date is not between the given start and end dates

				if (validatedData.date < planData.gtfs_feed_info.feed_start_date || validatedData.date > planData.gtfs_feed_info.feed_end_date) return;

				//
				// If we're here, it means the service_id is valid between the given dates.
				// Get the previously saved calendars and check if it exists for this service_id.

				const savedCalendar = savedCalendarDates.get(validatedData.service_id);

				if (savedCalendar) {
					// Create a new Set to avoid duplicated dates
					const updatedCalendar = new Set(savedCalendar);
					// If this service_id was previously saved, either add or remove the current date
					// to it based on the exception_type value for this row.
					if (validatedData.exception_type === 1) updatedCalendar.add(validatedData.date);
					else if (validatedData.exception_type === 2) updatedCalendar.delete(validatedData.date);
					// Update the service_id with the new dates
					savedCalendarDates.set(validatedData.service_id, Array.from(updatedCalendar));
				}
				else {
					// If this is the first time we're seeing this service_id, then it is only necessary
					// to initiate a new dates array if it is a service addition
					if (validatedData.exception_type === 1) {
						savedCalendarDates.set(validatedData.service_id, [validatedData.date]);
					}
				}

				//
			};

			//
			// Setup the CSV parsing operation only if the file exists

			if (fs.existsSync(`${extractDirPath}/calendar_dates.txt`)) {
				await parseCsvFile(`${extractDirPath}/calendar_dates.txt`, parseEachRow);
				LOGGER.success(`Finished processing "calendar_dates.txt": ${savedCalendarDates.size} service_ids saved.`);
				LOGGER.spacer(1);
			}
			else {
				LOGGER.info(`Optional file "calendar_dates.txt" not saved. This may or may not be an error. Proceeding...`);
				LOGGER.spacer(1);
			}

			//
		}
		catch (error) {
			LOGGER.error('Error processing "calendar_dates.txt" file.', error);
			throw new Error('✖︎ Error processing "calendar_dates.txt" file.');
		}

		/* * */
		/* TRIPS.TXT */

		//
		// Next up: trips.txt
		// Now that the calendars are sorted out, the jobs is easier for the trips.
		// Only include trips which have the referenced service IDs saved before.

		try {
			//

			LOGGER.info(`Reading zip entry "trips.txt"...`);

			const parseEachRow = async (data: GTFS_Trip_Extended_Raw) => {
				// Validate the current row against the proper type
				const validatedData = validateGtfsTripExtended(data);
				// For each trip, check if the associated service_id was saved
				// in the previous step or not. Include it if yes, skip otherwise.
				if (!savedCalendarDates.has(validatedData.service_id)) return;
				// Save the exported row
				savedTrips.set(validatedData.trip_id, validatedData);
				// Reference the associated entities to filter them later.
				referencedRouteIds.add(validatedData.route_id);
				referencedShapeIds.add(validatedData.shape_id);
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/trips.txt`, parseEachRow);

			LOGGER.success(`Finished processing "trips.txt": ${savedTrips.size} trips saved.`);
			LOGGER.spacer(1);

			//
		}
		catch (error) {
			LOGGER.error('Error processing "trips.txt" file.', error);
			throw new Error('✖︎ Error processing "trips.txt" file.');
		}

		/* * */
		/* ROUTES.TXT */

		//
		// Next up: routes.txt
		// For routes, only include the ones referenced in the filtered trips.

		try {
			//

			LOGGER.info(`Reading zip entry "routes.txt"...`);

			const parseEachRow = async (data: GTFS_Route_Extended_Raw) => {
				// Validate the current row against the proper type
				const validatedData = validateGtfsRouteExtended(data);
				// For each route, only save the ones referenced
				// by the previously saved trips.
				if (!referencedRouteIds.has(validatedData.route_id)) return;
				// Save the exported row
				savedRoutes.set(validatedData.route_id, validatedData);
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/routes.txt`, parseEachRow);

			LOGGER.success(`Finished processing "routes.txt": ${savedRoutes.size} routes saved.`);
			LOGGER.spacer(1);

			//
		}
		catch (error) {
			LOGGER.error('Error processing "routes.txt" file.', error);
			throw new Error('✖︎ Error processing "routes.txt" file.');
		}

		/* * */
		/* SHAPES.TXT */

		//
		// Next up: shapes.txt
		// Do a similiar check as the previous step.
		// Only include the shapes for trips referenced before.

		try {
			//

			LOGGER.info(`Reading zip entry "shapes.txt"...`);

			const parseEachRow = async (data: GTFS_Shape_Raw) => {
				// Validate the current row against the proper type
				const validatedData = validateGtfsShape(data);
				// For each route, only save the ones referenced
				// by the previously saved trips.
				if (!referencedShapeIds.has(validatedData.shape_id)) return;
				// Save the exported row
				const savedShape = savedShapes.get(validatedData.shape_id);
				if (savedShape) savedShapes.set(validatedData.shape_id, [...savedShape, validatedData]);
				else savedShapes.set(validatedData.shape_id, [validatedData]);
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/shapes.txt`, parseEachRow);

			LOGGER.success(`Finished processing "shapes.txt": ${savedShapes.size} shapes saved.`);
			LOGGER.spacer(1);

			//
		}
		catch (error) {
			LOGGER.error('Error processing "shapes.txt" file.', error);
			throw new Error('✖︎ Error processing "shapes.txt" file.');
		}

		/* * */
		/* STOPS.TXT */

		//
		// Next up: stops.txt
		// For stops, include all of them since we don't have a way to filter them yet like trips/routes/shapes.
		// By saving all of them, we also speed up the processing of each stop_time by including the stop data right away.

		try {
			//

			LOGGER.info(`Reading zip entry "stops.txt"...`);

			const parseEachRow = async (data: GTFS_Stop_Extended_Raw) => {
				// Validate the current row against the proper type
				const validatedData = validateGtfsStopExtended(data);
				// Save the exported row
				savedStops.set(validatedData.stop_id, validatedData);
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/stops.txt`, parseEachRow);

			LOGGER.success(`Finished processing "stops.txt": ${savedStops.size} stops saved.`);
			LOGGER.spacer(1);

			//
		}
		catch (error) {
			LOGGER.error('Error processing "stops.txt" file.', error);
			throw new Error('✖︎ Error processing "stops.txt" file.');
		}

		/* * */
		/* STOP_TIMES.TXT */

		//
		// Next up: stop_times.txt
		// Do a similiar check as the previous steps. Only include the stop_times for trips referenced before.
		// Since this is the most resource intensive operation of them all, include the associated stop data
		// right away to avoid another lookup later.

		try {
			//

			LOGGER.info(`Reading zip entry "stop_times.txt"...`);

			const parseEachRow = async (data: GTFS_StopTime_Raw) => {
				//

				//
				// Validate the current row against the proper type

				const validatedData = validateGtfsStopTime(data);

				//
				// For each stopTime of each trip, check if the associated trip_id was saved
				// in the previous step or not. Skip if this row's trip_id was not saved before.
				// Also, check if the stop_id is valid and was saved before.

				const tripData = savedTrips.get(validatedData.trip_id);
				if (!tripData) return;

				const stopData = savedStops.get(validatedData.stop_id);
				if (!stopData) return;

				//
				// Format the exported row. Only include the minimum required data
				// to prevent memory bloat later on, and include the stop data right away.

				const savedStopTime = savedStopTimes.get(validatedData.trip_id);

				if (savedStopTime) savedStopTimes.set(validatedData.trip_id, [...savedStopTime, validatedData]);
				else savedStopTimes.set(validatedData.trip_id, [validatedData]);

				//
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/stop_times.txt`, parseEachRow);

			LOGGER.success(`Finished processing "stop_times.txt": ${savedStopTimes.size} stop_times saved.`);
			LOGGER.spacer(1);

			//
		}
		catch (error) {
			LOGGER.error('Error processing "stop_times.txt" file.', error);
			throw new Error('✖︎ Error processing "stop_times.txt" file.');
		}

		/* * */
		/* OUTPUT FILES */

		//
		// Build the Ride, HashedTrip and HashedShape objects and save them to the database.
		// Each trip will have a Ride object created for each day it is scheduled to run.
		// For HashedTrips and HashedShapes, the content is hashed to prevent duplicates
		// and unnecessary database operations.

		try {
			//

			LOGGER.info(`Building HashedTrips, HashedShapes and Rides...`);

			for (const currentTrip of savedTrips.values()) {
				//

				//
				// Get associated data from previously saved entities,
				// as well as other commonly used variables in the next steps.

				const calendarDatesData = savedCalendarDates.get(currentTrip.service_id);
				const stopTimesData = savedStopTimes.get(currentTrip.trip_id);
				const routeData = savedRoutes.get(currentTrip.route_id);
				const shapeData = savedShapes.get(currentTrip.shape_id);

				const sortedStopTimesData = stopTimesData?.sort((a, b) => a.stop_sequence - b.stop_sequence);

				const lastStopTime = sortedStopTimesData[sortedStopTimesData.length - 1];

				/* * */
				/* HASHED TRIP */

				//
				// Build the HashedTrip data, including formatting the path data by combining
				// properties from stop_times and stops. Sort it by stop_sequence.

				const formattedHashedTripPath: HashedTripWaypoint[] = sortedStopTimesData.map((stopTime) => {
					// Get the stop data for this stop_time
					const stopData = savedStops.get(stopTime.stop_id);
					if (!stopData) throw new Error(`Stop "${stopTime.stop_id}" not found for trip "${currentTrip.trip_id}" for Plan "${planData._id}".`);
					// Normalize the shape_dist_traveled to meters, if necessary
					const normalizedShapeDistTraveled = convertMetersOrKilometersToMeters(stopTime.shape_dist_traveled, lastStopTime.shape_dist_traveled);
					// Return the formatted path data for this stop_time
					return {
						arrival_time: stopTime.arrival_time,
						departure_time: stopTime.departure_time,
						drop_off_type: stopTime.drop_off_type,
						pickup_type: stopTime.pickup_type,
						shape_dist_traveled: normalizedShapeDistTraveled,
						stop_id: stopTime.stop_id,
						stop_lat: stopData.stop_lat,
						stop_lon: stopData.stop_lon,
						stop_name: stopData.stop_name,
						stop_sequence: stopTime.stop_sequence,
						timepoint: stopTime.timepoint,
					};
				});

				const sortedHashedTripPath = formattedHashedTripPath.sort((a, b) => {
					return a.stop_sequence - b.stop_sequence;
				});

				//
				// To prevent duplicates, hash the object contents and check
				// if it already exists in the database. The hash value is
				// actually the _id of the HashedTrip document.

				const hashableHashedTrip: Omit<HashedTrip, '_id' | 'created_at' | 'updated_at'> = {
					agency_id: routeData.agency_id,
					line_id: routeData.line_id,
					line_long_name: routeData.line_long_name,
					line_short_name: routeData.line_short_name,
					path: sortedHashedTripPath,
					pattern_id: currentTrip.pattern_id,
					route_color: routeData.route_color,
					route_id: currentTrip.route_id,
					route_long_name: routeData.route_long_name,
					route_short_name: routeData.route_short_name,
					route_text_color: routeData.route_text_color,
					trip_headsign: currentTrip.trip_headsign,
				};

				const hashableHashedTripStringified = JSON.stringify(hashableHashedTrip);

				const uniqueIdValueForHashedTrip = crypto
					.createHash('sha256')
					.update(hashableHashedTripStringified)
					.digest('hex');

				//
				// Check if there is already a document with this unique ID value.
				// If it does not exist, save it to the database.

				const currentHashedTripAlreadyExists = await hashedTrips.findById(uniqueIdValueForHashedTrip);

				const finalHashedTrip: HashedTrip = {
					...hashableHashedTrip,
					_id: uniqueIdValueForHashedTrip,
					created_at: Dates.now('utc').unix_timestamp,
					updated_at: Dates.now('utc').unix_timestamp,
				};

				if (!currentHashedTripAlreadyExists) {
					await hashedTripsDbWritter.write(finalHashedTrip, { filter: { _id: finalHashedTrip._id }, upsert: true });
				}

				/* * */
				/* HASHED SHAPE */

				//
				// Build the HashedShape data, including formatting the points array.
				// Sort it by shape_pt_sequence.

				const formattedHashedShapePoints: HashedShapePoint[] = shapeData?.map((point) => {
					return {
						shape_dist_traveled: convertMetersOrKilometersToMeters(point.shape_dist_traveled, lastStopTime.shape_dist_traveled),
						shape_pt_lat: point.shape_pt_lat,
						shape_pt_lon: point.shape_pt_lon,
						shape_pt_sequence: point.shape_pt_sequence,
					};
				});

				const sortedHashedShapePoints: HashedShapePoint[] = formattedHashedShapePoints?.sort((a, b) => {
					return a.shape_pt_sequence - b.shape_pt_sequence;
				});

				//
				// To prevent duplicates, hash the object contents and check
				// if it already exists in the database. The hash value is
				// actually the _id of the HashedShape document.

				const hashableHashedShape: Omit<HashedShape, '_id' | 'created_at' | 'updated_at'> = {
					agency_id: routeData.agency_id,
					points: sortedHashedShapePoints,
				};

				const hashableHashedShapeStringified = JSON.stringify(hashableHashedShape);

				const uniqueIdValueForHashedShape = crypto
					.createHash('sha256')
					.update(hashableHashedShapeStringified)
					.digest('hex');

				//
				// Hash the hashed shape contents to prevent duplicates
				// Check if this hashed shape already exists. If it does not exist, save it to the database.

				//
				// Check if there is already a document with this unique ID value.
				// If it does not exist, save it to the database.

				const currentHashedShapeAlreadyExists = await hashedShapes.findById(uniqueIdValueForHashedShape);

				const finalHashedShape: HashedShape = {
					...hashableHashedShape,
					_id: uniqueIdValueForHashedShape,
					created_at: Dates.now('utc').unix_timestamp,
					updated_at: Dates.now('utc').unix_timestamp,
				};

				if (!currentHashedShapeAlreadyExists) {
					await hashedShapesDbWritter.write(finalHashedShape, { filter: { _id: finalHashedShape._id }, upsert: true });
				}

				/* * */
				/* RIDES */

				//
				// Build a Ride document for each day this trip is scheduled to run.
				// The Ride document will contain the hashed_trip_id and hashed_shape_id
				// as well as other properties derived from the previously saved entities.
				// Start by validating that this trip has a valid path.

				if (!finalHashedTrip || !finalHashedTrip.path || finalHashedTrip.path.length === 0) {
					LOGGER.error(`Trip ${currentTrip.trip_id} has no path data. Skipping...`);
					continue;
				}

				//
				// Setup variable that will be used multiple times in the next steps.

				const firstWaypoint = finalHashedTrip.path[0];
				const lastWaypoint = finalHashedTrip.path[finalHashedTrip.path.length - 1];

				const extensionScheduledInMeters = convertMetersOrKilometersToMeters(lastWaypoint.shape_dist_traveled, lastWaypoint.shape_dist_traveled);

				//
				// Iterate on the saved calendar dates for this trip,
				// and create a Ride document for each date.

				for (const calendarDate of calendarDatesData) {
					//

					//
					// Setup the required variables for the Ride document.

					const uniqueIdValueForRide = `${planData._id}-${routeData.agency_id}-${calendarDate}-${currentTrip.trip_id}`;

					const startTimeScheduledString = firstWaypoint.arrival_time;
					const startTimeScheduledDate = convertGTFSTimeStringAndOperationalDateToUnixTimestamp(startTimeScheduledString, calendarDate);

					const endTimeScheduledString = lastWaypoint.arrival_time;
					const endTimeScheduledDate = convertGTFSTimeStringAndOperationalDateToUnixTimestamp(endTimeScheduledString, calendarDate);

					//
					// Build the final Ride objects

					const finalRide: Ride = {
						_id: uniqueIdValueForRide,
						agency_id: routeData.agency_id,
						analysis: null,
						apex_locations_qty: null,
						apex_on_board_refunds_amount: null,
						apex_on_board_refunds_qty: null,
						apex_on_board_sales_amount: null,
						apex_on_board_sales_qty: null,
						apex_validations_qty: null,
						created_at: Dates.now('utc').unix_timestamp,
						driver_ids: [],
						end_time_observed: null,
						end_time_scheduled: endTimeScheduledDate,
						execution_status: null,
						extension_observed: null,
						extension_scheduled: extensionScheduledInMeters,
						hashed_shape_id: finalHashedShape._id,
						hashed_trip_id: finalHashedTrip._id,
						headsign: currentTrip.trip_headsign,
						is_locked: false,
						line_id: routeData.line_id,
						operational_date: calendarDate,
						passengers_estimated: null,
						passengers_observed: null,
						pattern_id: currentTrip.pattern_id,
						plan_id: planData._id,
						route_id: routeData.route_id,
						seen_first_at: null,
						seen_last_at: null,
						start_time_observed: null,
						start_time_scheduled: startTimeScheduledDate,
						system_status: 'pending',
						trip_id: currentTrip.trip_id,
						updated_at: Dates.now('utc').unix_timestamp,
						vehicle_ids: [],
					};

					//
					// Save this Ride document to the database using the
					// MongoDbWriter, and store the ID for later reference.

					const ridesOptions: MongoDbWriterWriteOptions = {
						filter: { _id: finalRide._id },
						upsert: true,
						write_mode: 'replace',
					};

					await ridesDbWritter.write(finalRide, ridesOptions);

					savedRideIds.add(finalRide._id);

					//
				}

				//
				// Delete the current trip to free up memory sooner

				savedTrips.delete(currentTrip.trip_id);
				savedStopTimes.delete(currentTrip.trip_id);

				//
			}

			//
			// Flush the writers to save all the data to the database
			// before changing the Plan status to 'success'.

			await hashedTripsDbWritter.flush();
			await hashedShapesDbWritter.flush();
			await ridesDbWritter.flush();

			//
		}
		catch (error) {
			LOGGER.error('Error transforming or saving Shapes, Trips or Rides to database.', error);
			throw new Error('✖︎ Error transforming or saving Shapes, Trips or Rides to database.');
		}

		//
		// Cleanup Rides that are no longer valid for this Plan.

		await cleanupOrphanRidesForPlan(planData._id, savedRideIds);

		//
		// Mark this plan as 'success' to indicate that it was processed successfully

		await plans.updateById(planData._id, { feeder_status: 'success' });

		LOGGER.success(`Finished processing plan "${planData._id}". (${globalTimer.get()})`);

		//
		// When a plan is successfully processed, the program must be restarted
		// to retrieve the latest data. This is because plans take a long time to process,
		// and in the meantime users may have changed status and updated files.

		LOGGER.divider('Restarting to fetch latest plan data...');

		process.exit(0);

		//
	}
	catch (error) {
		await plans.updateById(planData._id, { feeder_status: 'error' });
		LOGGER.error(`Error processing plan ${planData._id}`, error);
		LOGGER.divider();
	}
};

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function parseCsvFile(filePath: string, rowParser: (rowData: any) => Promise<void>) {
	const parser = csvParser({ bom: true, columns: true, record_delimiter: ['\n', '\r', '\r\n'], skip_empty_lines: true, trim: true });
	const fileStream = fs.createReadStream(filePath);
	const stream = fileStream.pipe(parser);
	for await (const rowData of stream) {
		await rowParser(rowData);
	}
}

/* * */

const unzipFile = async (zipFilePath, outputDir) => {
	await extract(zipFilePath, { dir: outputDir });
	setDirectoryPermissions(outputDir);
};

/* * */

const setDirectoryPermissions = (dirPath, mode = 0o666) => {
	const files = fs.readdirSync(dirPath, { withFileTypes: true });
	for (const file of files) {
		const filePath = `${dirPath}/${file.name}`;
		if (file.isDirectory()) {
			setDirectoryPermissions(filePath, mode);
		}
		else {
			fs.chmodSync(filePath, mode);
		}
	}
};

/* * */

const convertGTFSTimeStringAndOperationalDateToUnixTimestamp = (timeString: string, operationalDate: OperationalDate): UnixTimestamp => {
	//

	// Return early if no time string is provided
	if (!timeString || !operationalDate) throw new Error(`✖︎ No time string or operational date provided. timeString: ${timeString}, operationalDate: ${operationalDate}`);

	// Check if the timestring is in the format HH:MM:SS
	if (!/^\d{2}:\d{2}:\d{2}$/.test(timeString)) throw new Error(`✖︎ Invalid time string format. timeString: ${timeString}`);

	// Extract the individual components of the time string (HH:MM:SS)
	const [hoursOperation, minutesOperation, secondsOperation] = timeString.split(':').map(Number);

	return Dates
		.fromOperationalDate(operationalDate, 'Europe/Lisbon')
		.set({ hour: hoursOperation, minute: minutesOperation, second: secondsOperation })
		.unix_timestamp;

	//
};
