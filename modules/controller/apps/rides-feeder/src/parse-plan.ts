/* * */

import { cleanupOrphanRidesForPlan } from '@/cleanup.js';
import { Dates, getOperationalDatesFromRange } from '@tmlmobilidade/dates';
import { toMetersFromKilometersOrMeters } from '@tmlmobilidade/geo';
import { files, hashedPatterns, hashedShapes, hashedTrips, plans, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { SQLiteWriter } from '@tmlmobilidade/sqlite';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Calendar_Raw, type GTFS_CalendarDate_Raw, type GTFS_Route_Extended, type GTFS_Route_Extended_Raw, type GTFS_Shape, type GTFS_Shape_Raw, type GTFS_Stop_Extended, type GTFS_Stop_Extended_Raw, type GTFS_StopTime, type GTFS_StopTime_Raw, type GTFS_Trip_Extended, type GTFS_Trip_Extended_Raw, type HashedPattern, type HashedPatternWaypoint, type HashedShape, type HashedShapePoint, type HashedTrip, type HashedTripWaypoint, type OperationalDate, type Plan, type Ride, type UnixTimestamp, validateGtfsCalendar, validateGtfsCalendarDate, validateGtfsPickupDropoffType, validateGtfsRouteExtended, validateGtfsShape, validateGtfsStopExtended, validateGtfsStopTime, validateGtfsTripExtended } from '@tmlmobilidade/types';
import { convertGTFSTimeStringAndOperationalDateToUnixTimestamp } from '@tmlmobilidade/utils';
import { MongoDbWriter, type MongoDbWriterWriteOptions } from '@tmlmobilidade/writers';
import crypto from 'crypto';
import { parse as csvParser } from 'csv-parse';
import fs from 'node:fs';
import unzipper from 'unzipper';

/* * */

export async function parsePlan(planData: Plan) {
	//

	const globalTimer = new Timer();

	//
	// Setup variables to save formatted entities found in this Plan

	const savedRideIds = new Set<string>();

	const referencedRouteIds = new Set<string>();
	const referencedShapeIds = new Set<string>();

	let calendarDatesCounter = 0;
	let tripsCounter = 0;
	let shapesCounter = 0;
	let stopTimesCounter = 0;

	let hashedPatternsCounter = 0;
	let hashedShapesCounter = 0;
	let hashedTripsCounter = 0;

	//
	// Connect to databases and setup MongoDB Writers

	const hashedPatternsCollection = await hashedPatterns.getCollection();
	const hashedShapesCollection = await hashedShapes.getCollection();
	const hashedTripsCollection = await hashedTrips.getCollection();
	const ridesCollection = await rides.getCollection();

	const hashedPatternsDbWritter = new MongoDbWriter<HashedPattern>({ batch_size: 1000, collection: hashedPatternsCollection });
	const hashedShapesDbWritter = new MongoDbWriter<HashedShape>({ batch_size: 1000, collection: hashedShapesCollection });
	const hashedTripsDbWritter = new MongoDbWriter<HashedTrip>({ batch_size: 1000, collection: hashedTripsCollection });
	const ridesDbWritter = new MongoDbWriter<Ride>({ batch_size: 10000, collection: ridesCollection });

	//
	// Setup Maps and SQLite writers to temporarily store data

	const savedCalendarDates = new Map<string, OperationalDate[]>();

	const savedTrips = new SQLiteWriter<GTFS_Trip_Extended>({
		batch_size: 10000,
		columns: [
			{ indexed: true, name: 'trip_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'bikes_allowed', type: 'INTEGER' },
			{ indexed: false, name: 'block_id', type: 'TEXT' },
			{ indexed: false, name: 'direction_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'route_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'service_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'shape_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'trip_headsign', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'trip_short_name', type: 'TEXT' },
			{ indexed: false, name: 'wheelchair_accessible', type: 'INTEGER' },
			{ indexed: false, name: 'pattern_id', not_null: true, type: 'TEXT' },
		],
	});

	const savedRoutes = new SQLiteWriter<GTFS_Route_Extended>({
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'agency_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'continuous_drop_off', type: 'INTEGER' },
			{ indexed: false, name: 'continuous_pickup', type: 'INTEGER' },
			{ indexed: false, name: 'route_color', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_desc', type: 'TEXT' },
			{ indexed: true, name: 'route_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'route_long_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_short_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_sort_order', type: 'INTEGER' },
			{ indexed: false, name: 'route_text_color', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'route_type', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'route_url', type: 'TEXT' },
			{ indexed: false, name: 'circular', type: 'INTEGER' },
			{ indexed: false, name: 'line_id', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'line_long_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'line_short_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'path_type', type: 'INTEGER' },
			{ indexed: false, name: 'route_remarks', type: 'TEXT' },
			{ indexed: false, name: 'school', type: 'INTEGER' },
		],
	});

	const savedShapes = new SQLiteWriter<GTFS_Shape>({
		batch_size: 100000,
		columns: [
			{ indexed: true, name: 'shape_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'shape_pt_lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_pt_lon', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'shape_pt_sequence', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'shape_dist_traveled', not_null: true, type: 'REAL' },
		],
	});

	const savedStops = new SQLiteWriter<GTFS_Stop_Extended>({
		batch_size: 10000,
		columns: [
			{ indexed: false, name: 'level_id', type: 'TEXT' },
			{ indexed: false, name: 'location_type', type: 'INTEGER' },
			{ indexed: false, name: 'parent_station', type: 'TEXT' },
			{ indexed: false, name: 'platform_code', type: 'TEXT' },
			{ indexed: false, name: 'stop_code', type: 'TEXT' },
			{ indexed: false, name: 'stop_desc', type: 'TEXT' },
			{ indexed: true, name: 'stop_id', not_null: true, primary_key: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_lat', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'stop_lon', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'stop_name', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_timezone', type: 'TEXT' },
			{ indexed: false, name: 'stop_url', type: 'TEXT' },
			{ indexed: false, name: 'wheelchair_boarding', type: 'INTEGER' },
			{ indexed: false, name: 'zone_id', type: 'TEXT' },
			{ indexed: false, name: 'has_bench', type: 'INTEGER' },
			{ indexed: false, name: 'has_network_map', type: 'INTEGER' },
			{ indexed: false, name: 'has_pip_real_time', type: 'INTEGER' },
			{ indexed: false, name: 'has_schedules', type: 'INTEGER' },
			{ indexed: false, name: 'has_shelter', type: 'INTEGER' },
			{ indexed: false, name: 'has_stop_sign', type: 'INTEGER' },
			{ indexed: false, name: 'has_tariffs_information', type: 'INTEGER' },
			{ indexed: false, name: 'municipality_id', type: 'TEXT' },
			{ indexed: false, name: 'parish_id', type: 'TEXT' },
			{ indexed: false, name: 'public_visible', type: 'INTEGER' },
			{ indexed: false, name: 'region_id', type: 'TEXT' },
			{ indexed: false, name: 'shelter_code', type: 'TEXT' },
			{ indexed: false, name: 'shelter_maintainer', type: 'TEXT' },
			{ indexed: false, name: 'stop_short_name', type: 'TEXT' },
			{ indexed: false, name: 'tts_stop_name', type: 'TEXT' },
		],
	});

	const savedStopTimes = new SQLiteWriter<GTFS_StopTime>({
		batch_size: 100000,
		columns: [
			{ indexed: false, name: 'arrival_time', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'continuous_drop_off', type: 'INTEGER' },
			{ indexed: false, name: 'continuous_pickup', type: 'INTEGER' },
			{ indexed: false, name: 'departure_time', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'drop_off_type', type: 'INTEGER' },
			{ indexed: false, name: 'pickup_type', type: 'INTEGER' },
			{ indexed: false, name: 'shape_dist_traveled', not_null: true, type: 'REAL' },
			{ indexed: false, name: 'stop_headsign', type: 'TEXT' },
			{ indexed: true, name: 'stop_id', not_null: true, type: 'TEXT' },
			{ indexed: true, name: 'trip_id', not_null: true, type: 'TEXT' },
			{ indexed: false, name: 'stop_sequence', not_null: true, type: 'INTEGER' },
			{ indexed: false, name: 'timepoint', type: 'INTEGER' },
		],
	});

	//
	// Prepare the working directories to work with the zip file
	// and the extracted files. Try to download and unzip the archive.

	const workdirPath = `/tmp/${planData._id}`;
	const downloadFilePath = `${workdirPath}/${planData.operation_file_id}.zip`;
	const extractDirPath = `${workdirPath}/extracted`;

	try {
		fs.rmSync(workdirPath, { force: true, recursive: true });
		fs.mkdirSync(workdirPath, { recursive: true });
		Logger.success('Prepared working directory.', 1);
	} catch (error) {
		Logger.error(`Error preparing workdir path "${workdirPath}".`, error);
		process.exit(1);
	}

	//
	// Validate if the plan has the necessary properties
	// required for processing (dates and operation file).

	if (!planData.gtfs_feed_info.feed_start_date || !planData.gtfs_feed_info.feed_end_date) {
		Logger.error(`Plan "${planData._id}" is missing gtfs_feed_info with feed_start_date and feed_end_date properties.`);
		process.exit(1);
	}

	//
	// Get the associated Operation GTFS archive URL,
	// and try to download, save and unzip it.

	Logger.info(`Fetching operation file from "${planData.operation_file_id}".`);

	const operationFileData = await files.findById(planData.operation_file_id);

	if (!operationFileData?.url) {
		Logger.error(`No operation file found for plan "${planData._id}".`);
		process.exit(1);
	}

	Logger.info(`Downloading operation file from "${operationFileData.url}".`);

	try {
		const downloadResponse = await fetch(operationFileData.url);
		const downloadArrayBuffer = await downloadResponse.arrayBuffer();
		fs.writeFileSync(downloadFilePath, Buffer.from(downloadArrayBuffer));
		Logger.success(`Downloaded operation file to "${downloadFilePath}".`);
	} catch (error) {
		Logger.error('Error downloading the file.', error);
		process.exit(1);
	}

	try {
		Logger.info(`Unzipping operation file from "${downloadFilePath}" to "${extractDirPath}".`);
		await unzipFile(downloadFilePath, extractDirPath);
		Logger.success(`Unzipped GTFS file from "${downloadFilePath}" to "${extractDirPath}".`, 1);
	} catch (error) {
		Logger.error('Error unzipping the file.', error);
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

		const calendarParseTimer = new Timer();

		Logger.info(`Reading zip entry "calendar.txt"...`);

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

			const validOperationalDates = new Set<OperationalDate>();

			for (const currentDate of allOperationalDatesInRange) {
				const dayOfWeek = Dates.fromOperationalDate(currentDate, 'Europe/Lisbon').toFormat('c');
				if (dayOfWeek === '1' && validatedData.monday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '2' && validatedData.tuesday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '3' && validatedData.wednesday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '4' && validatedData.thursday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '5' && validatedData.friday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '6' && validatedData.saturday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '7' && validatedData.sunday === 1) validOperationalDates.add(currentDate);
			}

			//
			// Save the valid operational dates for this service_id

			savedCalendarDates.set(validatedData.service_id, Array.from(validOperationalDates));

			calendarDatesCounter += validOperationalDates.size;

			//
		};

		//
		// Setup the CSV parsing operation only if the file exists

		if (fs.existsSync(`${extractDirPath}/calendar.txt`)) {
			await parseCsvFile(`${extractDirPath}/calendar.txt`, parseEachRow);
			Logger.success(`Finished processing "calendar.txt": ${savedCalendarDates.size} rows saved in ${calendarParseTimer.get()}.`, 1);
		} else {
			Logger.info(`Optional file "calendar.txt" not found. This may or may not be an error. Proceeding...`, 1);
		}

		//
	} catch (error) {
		Logger.error('Error processing "calendar.txt" file.', error);
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

		const calendarDatesParseTimer = new Timer();

		Logger.info(`Reading zip entry "calendar_dates.txt"...`);

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
				if (validatedData.exception_type === 1) {
					updatedCalendar.add(validatedData.date);
					calendarDatesCounter++;
				} else if (validatedData.exception_type === 2) {
					updatedCalendar.delete(validatedData.date);
					calendarDatesCounter--;
				}
				// Update the service_id with the new dates
				savedCalendarDates.set(validatedData.service_id, Array.from(updatedCalendar));
			} else {
				// If this is the first time we're seeing this service_id, then it is only necessary
				// to initiate a new dates array if it is a service addition
				if (validatedData.exception_type === 1) {
					savedCalendarDates.set(validatedData.service_id, [validatedData.date]);
					calendarDatesCounter++;
				}
			}

			//
		};

		//
		// Setup the CSV parsing operation only if the file exists

		if (fs.existsSync(`${extractDirPath}/calendar_dates.txt`)) {
			await parseCsvFile(`${extractDirPath}/calendar_dates.txt`, parseEachRow);
			Logger.success(`Finished processing "calendar_dates.txt": ${savedCalendarDates.size} rows saved in ${calendarDatesParseTimer.get()}.`, 1);
		} else {
			Logger.info(`Optional file "calendar_dates.txt" not found. This may or may not be an error. Proceeding...`, 1);
		}

		//
	} catch (error) {
		Logger.error('Error processing "calendar_dates.txt" file.', error);
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

		const tripsParseTimer = new Timer();

		Logger.info(`Reading zip entry "trips.txt"...`);

		const parseEachRow = async (data: GTFS_Trip_Extended_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsTripExtended(data);
			// For each trip, check if the associated service_id was saved
			// in the previous step or not. Include it if yes, skip otherwise.
			if (!savedCalendarDates.has(validatedData.service_id)) return;
			// Save the exported row
			savedTrips.write(validatedData);
			// Reference the associated entities to filter them later.
			referencedRouteIds.add(validatedData.route_id);
			referencedShapeIds.add(validatedData.shape_id);
			// Log progress
			if (tripsCounter % 10000 === 0) Logger.info(`Parsed ${tripsCounter} trips.txt rows so far.`);
			// Increment the counter
			tripsCounter++;
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${extractDirPath}/trips.txt`, parseEachRow);

		savedTrips.flush();

		Logger.success(`Finished processing "trips.txt": ${savedTrips.size} rows saved in ${tripsParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error('Error processing "trips.txt" file.', error);
		throw new Error('✖︎ Error processing "trips.txt" file.');
	}

	/* * */
	/* ROUTES.TXT */

	//
	// Next up: routes.txt
	// For routes, only include the ones referenced in the filtered trips.

	try {
		//

		const routesParseTimer = new Timer();

		Logger.info(`Reading zip entry "routes.txt"...`);

		const parseEachRow = async (data: GTFS_Route_Extended_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsRouteExtended(data);
			// For each route, only save the ones referenced
			// by the previously saved trips.
			if (!referencedRouteIds.has(validatedData.route_id)) return;
			// Save the exported row
			savedRoutes.write(validatedData);
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${extractDirPath}/routes.txt`, parseEachRow);

		savedRoutes.flush();

		Logger.success(`Finished processing "routes.txt": ${savedRoutes.size} rows saved in ${routesParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error('Error processing "routes.txt" file.', error);
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

		const shapesParseTimer = new Timer();

		Logger.info(`Reading zip entry "shapes.txt"...`);

		const parseEachRow = async (data: GTFS_Shape_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsShape(data);
			// For each route, only save the ones referenced
			// by the previously saved trips.
			if (!referencedShapeIds.has(validatedData.shape_id)) return;
			// Save the exported row
			savedShapes.write(validatedData);
			// Log progress
			if (shapesCounter % 100000 === 0) Logger.info(`Parsed ${shapesCounter} shapes.txt rows so far.`);
			// Increment the counter
			shapesCounter++;
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${extractDirPath}/shapes.txt`, parseEachRow);

		savedShapes.flush();

		Logger.success(`Finished processing "shapes.txt": ${savedShapes.size} rows saved in ${shapesParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error('Error processing "shapes.txt" file.', error);
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

		const stopsParseTimer = new Timer();

		Logger.info(`Reading zip entry "stops.txt"...`);

		const parseEachRow = async (data: GTFS_Stop_Extended_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsStopExtended(data);
			// Save the exported row
			savedStops.write(validatedData);
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${extractDirPath}/stops.txt`, parseEachRow);

		savedStops.flush();

		Logger.success(`Finished processing "stops.txt": ${savedStops.size} rows saved in ${stopsParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error('Error processing "stops.txt" file.', error);
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

		const stopTimesParseTimer = new Timer();

		Logger.info(`Reading zip entry "stop_times.txt"...`);

		const parseEachRow = async (data: GTFS_StopTime_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsStopTime(data);
			// Skip if this row's trip_id was not saved before.
			const tripData = savedTrips.get('trip_id', validatedData.trip_id);
			if (!tripData) return;
			// Also, check if the stop_id is valid and was saved before.
			const stopData = savedStops.get('stop_id', validatedData.stop_id);
			if (!stopData) return;
			// Save the exported row
			savedStopTimes.write(validatedData);
			// Log progress
			if (stopTimesCounter % 100000 === 0) Logger.info(`Parsed ${stopTimesCounter} stop_times.txt rows so far.`);
			// Increment the counter
			stopTimesCounter++;
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${extractDirPath}/stop_times.txt`, parseEachRow);

		savedStopTimes.flush();

		Logger.success(`Finished processing "stop_times.txt": ${stopTimesCounter} rows saved in ${stopTimesParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error('Error processing "stop_times.txt" file.', error);
		throw new Error('✖︎ Error processing "stop_times.txt" file.');
	}

	/* * */
	/* OUTPUT FILES */

	//
	// Build the Ride, HashedPattern, HashedTrip and HashedShape objects and save them.
	// Each trip will have a Ride object created for each day it is scheduled to run.
	// For HashedPatterns, HashedTrips and HashedShapes, the content is hashed to prevent
	// duplicates and unnecessary database operations.

	try {
		//

		const outputsTimer = new Timer();

		Logger.title(`Generating HashedPatterns, HashedTrips, HashedShapes and Rides:`);

		Logger.info(`Dates: ${calendarDatesCounter} for ${savedCalendarDates.size} service_ids`);
		Logger.info(`Trips: ${tripsCounter}`);
		Logger.info(`Routes: ${savedRoutes.size}`);
		Logger.info(`Shapes: ${savedShapes.size}`);
		Logger.info(`Stops: ${savedStops.size}`);
		Logger.info(`StopTimes: ${stopTimesCounter} rows`, 1);

		for (const currentTrip of savedTrips.all()) {
			//

			//
			// Log every 10000 rides processed

			if (tripsCounter % 10000 === 0) Logger.title(`${tripsCounter} trips left. ${stopTimesCounter} stop_times left. Generated ${savedRideIds.size} Rides so far. `);

			//
			// Get associated data from previously saved entities,
			// as well as other commonly used variables in the next steps.

			const calendarDatesData = savedCalendarDates.get(currentTrip.service_id);
			const stopTimesData = savedStopTimes.all('WHERE trip_id = ? ORDER BY stop_sequence ASC', [currentTrip.trip_id]);
			const routeData = savedRoutes.get('route_id', currentTrip.route_id);
			const shapeData = savedShapes.all('WHERE shape_id = ?', [currentTrip.shape_id]);

			//
			// Validate the required data for this trip
			// to prevent errors later on.

			if (!calendarDatesData || calendarDatesData.length === 0) {
				Logger.error(`Trip "${currentTrip.trip_id}" has no calendar dates. Skipping...`);
				continue;
			}

			if (!stopTimesData || stopTimesData.length === 0) {
				Logger.error(`Trip "${currentTrip.trip_id}" has no stop_times data. Skipping...`);
				continue;
			}

			if (!routeData) {
				Logger.error(`Trip "${currentTrip.trip_id}" has no route data. Skipping...`);
				continue;
			}

			if (!shapeData || shapeData.length === 0) {
				Logger.error(`Trip "${currentTrip.trip_id}" has no shape data. Skipping...`);
				continue;
			}

			//
			// Extract commonly used variables use in the next steps
			// to avoid repeated lookups and calculations.

			const sortedStopTimesData = stopTimesData?.sort((a, b) => a.stop_sequence - b.stop_sequence);

			const lastStopTime = sortedStopTimesData[sortedStopTimesData.length - 1];

			/* * */
			/* HASHED PATTERN */

			//
			// Build the HashedPattern data, including formatting the path data by combining
			// properties from stop_times and stops. Sort it by stop_sequence.

			const formattedHashedPatternPath: HashedPatternWaypoint[] = sortedStopTimesData.map((stopTime) => {
				// Get the stop data for this stop_time
				const stopData = savedStops.get('stop_id', stopTime.stop_id);
				if (!stopData) throw new Error(`Stop "${stopTime.stop_id}" not found for trip "${currentTrip.trip_id}" for Plan "${planData._id}".`);
				// Normalize the shape_dist_traveled to meters, if necessary
				const normalizedShapeDistTraveled = toMetersFromKilometersOrMeters(stopTime.shape_dist_traveled, lastStopTime.shape_dist_traveled);
				// Return the formatted path data for this stop_time
				return {
					drop_off_type: validateGtfsPickupDropoffType(stopTime.drop_off_type),
					pickup_type: validateGtfsPickupDropoffType(stopTime.pickup_type),
					shape_dist_traveled: normalizedShapeDistTraveled,
					stop_id: stopTime.stop_id,
					stop_lat: stopData.stop_lat,
					stop_lon: stopData.stop_lon,
					stop_name: stopData.stop_name,
					stop_sequence: stopTime.stop_sequence,
					timepoint: stopTime.timepoint,
				};
			});

			const sortedHashedPatternPath = formattedHashedPatternPath.sort((a, b) => {
				return a.stop_sequence - b.stop_sequence;
			});

			//
			// To prevent duplicates, hash the object contents and check
			// if it already exists in the database. The hash value is
			// actually the _id of the HashedPattern document.

			const hashableHashedPattern: Omit<HashedPattern, '_id' | 'created_at' | 'updated_at'> = {
				agency_id: routeData.agency_id,
				line_id: Number(routeData.line_id),
				line_long_name: routeData.line_long_name,
				line_short_name: routeData.line_short_name,
				path: sortedHashedPatternPath,
				pattern_id: currentTrip.pattern_id,
				route_color: routeData.route_color,
				route_id: currentTrip.route_id,
				route_long_name: routeData.route_long_name,
				route_short_name: routeData.route_short_name,
				route_text_color: routeData.route_text_color,
				trip_headsign: currentTrip.trip_headsign,
			};

			const hashableHashedPatternStringified = JSON.stringify(hashableHashedPattern);

			const uniqueIdValueForHashedPattern = crypto
				.createHash('sha256')
				.update(hashableHashedPatternStringified)
				.digest('hex');

			//
			// Check if there is already a document with this unique ID value.
			// If it does not exist, save it to the database.

			const currentHashedPatternAlreadyExists = await hashedPatterns.existsById(uniqueIdValueForHashedPattern);

			const finalHashedPattern: HashedPattern = {
				...hashableHashedPattern,
				_id: uniqueIdValueForHashedPattern,
				created_at: Dates.now('utc').unix_timestamp,
				updated_at: Dates.now('utc').unix_timestamp,
			};

			if (!currentHashedPatternAlreadyExists) {
				await hashedPatternsDbWritter.write(finalHashedPattern, { filter: { _id: finalHashedPattern._id }, upsert: true });
				hashedPatternsCounter++;
			}

			/* * */
			/* HASHED TRIP */

			//
			// Build the HashedTrip data, including formatting the path data by combining
			// properties from stop_times and stops. Sort it by stop_sequence.

			const formattedHashedTripPath: HashedTripWaypoint[] = sortedStopTimesData.map((stopTime) => {
				// Get the stop data for this stop_time
				const stopData = savedStops.get('stop_id', stopTime.stop_id);
				if (!stopData) throw new Error(`Stop "${stopTime.stop_id}" not found for trip "${currentTrip.trip_id}" for Plan "${planData._id}".`);
				// Normalize the shape_dist_traveled to meters, if necessary
				const normalizedShapeDistTraveled = toMetersFromKilometersOrMeters(stopTime.shape_dist_traveled, lastStopTime.shape_dist_traveled);
				// Return the formatted path data for this stop_time
				return {
					arrival_time: stopTime.arrival_time,
					departure_time: stopTime.departure_time,
					drop_off_type: validateGtfsPickupDropoffType(stopTime.drop_off_type),
					pickup_type: validateGtfsPickupDropoffType(stopTime.pickup_type),
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
				line_id: Number(routeData.line_id),
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

			const currentHashedTripAlreadyExists = await hashedTrips.existsById(uniqueIdValueForHashedTrip);

			const finalHashedTrip: HashedTrip = {
				...hashableHashedTrip,
				_id: uniqueIdValueForHashedTrip,
				created_at: Dates.now('utc').unix_timestamp,
				updated_at: Dates.now('utc').unix_timestamp,
			};

			if (!currentHashedTripAlreadyExists) {
				await hashedTripsDbWritter.write(finalHashedTrip, { filter: { _id: finalHashedTrip._id }, upsert: true });
				hashedTripsCounter++;
			}

			/* * */
			/* HASHED SHAPE */

			//
			// Build the HashedShape data, including formatting the points array.
			// Sort it by shape_pt_sequence.

			const formattedHashedShapePoints: HashedShapePoint[] = shapeData?.map((point) => {
				return {
					shape_dist_traveled: toMetersFromKilometersOrMeters(point.shape_dist_traveled, lastStopTime.shape_dist_traveled),
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
			// Check if there is already a document with this unique ID value.
			// If it does not exist, save it to the database.

			const currentHashedShapeAlreadyExists = await hashedShapes.existsById(uniqueIdValueForHashedShape);

			const finalHashedShape: HashedShape = {
				...hashableHashedShape,
				_id: uniqueIdValueForHashedShape,
				created_at: Dates.now('utc').unix_timestamp,
				updated_at: Dates.now('utc').unix_timestamp,
			};

			if (!currentHashedShapeAlreadyExists) {
				await hashedShapesDbWritter.write(finalHashedShape, { filter: { _id: finalHashedShape._id }, upsert: true });
				hashedShapesCounter++;
			}

			/* * */
			/* RIDES */

			//
			// Build a Ride document for each day this trip is scheduled to run.
			// The Ride document will contain the hashed_trip_id and hashed_shape_id
			// as well as other properties derived from the previously saved entities.
			// Start by validating that this trip has a valid path.

			if (!finalHashedTrip?.path || finalHashedTrip.path.length === 0) {
				Logger.error(`Trip ${currentTrip.trip_id} has no path data. Skipping...`);
				continue;
			}

			//
			// Setup variable that will be used multiple times in the next steps.

			const firstWaypoint = finalHashedTrip.path[0];
			const lastWaypoint = finalHashedTrip.path[finalHashedTrip.path.length - 1];

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
					created_by: 'system',
					driver_ids: [],
					end_time_observed: null,
					end_time_scheduled: endTimeScheduledDate,
					extension_observed: null,
					extension_scheduled: extensionScheduledInMeters,
					hashed_pattern_id: finalHashedPattern._id,
					hashed_shape_id: finalHashedShape._id,
					hashed_trip_id: finalHashedTrip._id,
					headsign: currentTrip.trip_headsign,
					line_id: Number(routeData.line_id),
					operational_date: calendarDate,
					passengers_estimated: null,
					passengers_observed: null,
					passengers_observed_on_board_sales_amount: null,
					passengers_observed_on_board_sales_qty: null,
					passengers_observed_prepaid_amount: null,
					passengers_observed_prepaid_qty: null,
					passengers_observed_subscription_qty: null,
					pattern_id: currentTrip.pattern_id,
					plan_id: planData._id,
					route_id: routeData.route_id,
					seen_first_at: null,
					seen_last_at: null,
					start_time_observed: null,
					start_time_scheduled: startTimeScheduledDate,
					system_status: 'waiting',
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
			// Decrement the trips and stop times counters
			// to keep track of progress in the logs

			tripsCounter--;
			stopTimesCounter--;

			//
		}

		//
		// Flush the writers to save all the data to the database
		// before changing the Plan status to 'success'.

		await hashedPatternsDbWritter.flush();
		await hashedShapesDbWritter.flush();
		await hashedTripsDbWritter.flush();
		await ridesDbWritter.flush();

		//
		// Cleanup the saved entities to avoid
		// storing so much data on disk.

		savedCalendarDates.clear();
		savedTrips.clear();
		savedStops.clear();
		savedRoutes.clear();
		savedShapes.clear();
		savedStopTimes.clear();

		//
		// Log progress

		Logger.info(`Saved ${savedRideIds.size} Rides, ${hashedPatternsCounter} HashedPatterns, ${hashedTripsCounter} HashedTrips, ${hashedShapesCounter} HashedShapes in ${outputsTimer.get()}.`);

		//
	} catch (error) {
		Logger.error('Error transforming or saving Shapes, Trips or Rides to database.', error);
		throw new Error('✖︎ Error transforming or saving Shapes, Trips or Rides to database.');
	}

	//
	// Cleanup Rides that are no longer valid for this Plan.

	await cleanupOrphanRidesForPlan(planData._id, savedRideIds);

	//
	// Mark this plan as 'complete' to indicate that it was processed successfully

	const plansCollection = await plans.getCollection();

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

export async function unzipFile(zipFilePath: string, outputDir: string) {
	await fs
		.createReadStream(zipFilePath)
		.pipe(unzipper.Extract({ path: outputDir }))
		.promise();
	setDirectoryPermissions(outputDir);
}

/* * */

const setDirectoryPermissions = (dirPath, mode = 0o666) => {
	const files = fs.readdirSync(dirPath, { withFileTypes: true });
	for (const file of files) {
		const filePath = `${dirPath}/${file.name}`;
		if (file.isDirectory()) {
			setDirectoryPermissions(filePath, mode);
		} else {
			fs.chmodSync(filePath, mode);
		}
	}
};

