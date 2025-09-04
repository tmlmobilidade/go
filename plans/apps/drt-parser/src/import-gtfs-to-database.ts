/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { SQLiteWriter } from '@tmlmobilidade/connectors';
import { files } from '@tmlmobilidade/interfaces';
import { GTFS_Calendar_Raw, GTFS_CalendarDate_Raw, GTFS_Route_Extended, GTFS_Route_Extended_Raw, GTFS_Shape, GTFS_Shape_Raw, GTFS_Stop_Extended, GTFS_Stop_Extended_Raw, GTFS_StopTime, GTFS_StopTime_Raw, GTFS_Trip_Extended, GTFS_Trip_Extended_Raw, Plan, validateGtfsCalendar, validateGtfsCalendarDate, validateGtfsRouteExtended, validateGtfsShape, validateGtfsStopExtended, validateGtfsStopTime, validateGtfsTripExtended } from '@tmlmobilidade/types';
import { OperationalDate } from '@tmlmobilidade/types';
import { Dates, getOperationalDatesFromRange } from '@tmlmobilidade/utils';
import fs from 'fs';

import { parseCsvFile, unzipFile } from './utils.js';

/* * */

export interface ImportGtfsToDatabaseConfig {
	endDate?: OperationalDate
	startDate?: OperationalDate
}

export interface GtfsSQLWriters {
	savedCalendarDates: Map<string, OperationalDate[]>
	savedRoutes: SQLiteWriter<Partial<GTFS_Route_Extended>>
	savedShapes: SQLiteWriter<GTFS_Shape>
	savedStops: SQLiteWriter<GTFS_Stop_Extended>
	savedStopTimes: SQLiteWriter<GTFS_StopTime>
	savedTrips: SQLiteWriter<GTFS_Trip_Extended>
}

interface Context {
	counters: {
		calendarDates: number
		hashedShapes: number
		hashedTrips: number
		shapes: number
		stopTimes: number
		trips: number
	}
	planData: Plan
	referencedRouteIds: Set<string>
	referencedShapeIds: Set<string>
	workdir: {
		downloadFilePath: string
		extractDirPath: string
		path: string
	}
	writers: GtfsSQLWriters
}

/* * */
/* INITIALIZE SQL WRITERS */
function intializeSQLWriters(): Context['writers'] {
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

	const savedRoutes = new SQLiteWriter<Partial<GTFS_Route_Extended>>({
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

	return {
		savedCalendarDates,
		savedRoutes,
		savedShapes,
		savedStops,
		savedStopTimes,
		savedTrips,
	};
}

/* * */
/* DOWNLOAD AND EXTRACT GTFS FILE */
async function downloadAndExtractGtfs(planData: Plan): Promise<Context['workdir']> {
	//

	// Return early if no operation file is found

	if (!planData.operation_file_id) {
		LOGGER.error(`No operation file found for plan "${planData._id}".`);
		process.exit(1);
	}

	//
	// Prepare the working directory

	const workdirPath = `/tmp/${planData._id}`;
	const downloadFilePath = `${workdirPath}/${planData.operation_file_id}.zip`;
	const extractDirPath = `${workdirPath}/extracted`;

	try {
		fs.rmSync(workdirPath, { force: true, recursive: true });
		fs.mkdirSync(workdirPath, { recursive: true });

		LOGGER.success('Prepared working directory.', 1);
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
		LOGGER.error('Error downloading the file.', error);
		process.exit(1);
	}

	try {
		await unzipFile(downloadFilePath, extractDirPath);
		LOGGER.success(`Unzipped GTFS file from "${downloadFilePath}" to "${extractDirPath}".`, 1);
	}
	catch (error) {
		LOGGER.error('Error unzipping the file.', error);
		process.exit(1);
	}

	return { downloadFilePath, extractDirPath, path: workdirPath };
}

/* * */
/* ====== PARSERS ====== */
/* * */

/* * */
/* PARSE CALENDAR.TXT */
async function processCalendarFile(context: Context, startDate: OperationalDate, endDate: OperationalDate): Promise<void> {
	//
	// Extract calendar.txt and filter only service_ids
	// that are valid between the given start_date and end_date.

	try {
		//

		const calendarParseTimer = new TIMETRACKER();

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

			if (serviceIdEndDate < startDate || serviceIdStartDate > endDate) return;

			if (serviceIdStartDate < startDate) serviceIdStartDate = startDate;
			if (serviceIdEndDate > endDate) serviceIdEndDate = endDate;

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

			context.writers.savedCalendarDates.set(validatedData.service_id, Array.from(validOperationalDates));

			context.counters.calendarDates += validOperationalDates.size;

			//
		};

		//
		// Setup the CSV parsing operation only if the file exists

		if (fs.existsSync(`${context.workdir.extractDirPath}/calendar.txt`)) {
			await parseCsvFile(`${context.workdir.extractDirPath}/calendar.txt`, parseEachRow);
			LOGGER.success(`Finished processing "calendar.txt": ${context.writers.savedCalendarDates.size} rows saved in ${calendarParseTimer.get()}.`, 1);
		}
		else {
			LOGGER.info(`Optional file "calendar.txt" not found. This may or may not be an error. Proceeding...`, 1);
		}

		//
	}
	catch (error) {
		LOGGER.error('Error processing "calendar.txt" file.', error);
		throw new Error('✖︎ Error processing "calendar.txt" file.');
	}
}

/* * */
/* PARSE CALENDAR_DATES.TXT */
async function processCalendarDatesFile(context: Context, startDate: OperationalDate, endDate: OperationalDate): Promise<void> {
	//
	// Extract calendar_dates.txt and either update the previously saved service_ids,
	// based on the configured exception_type, or create new service_ids that were not
	// present in calendar.txt and are between the given start and end dates.

	try {
		//

		const calendarDatesParseTimer = new TIMETRACKER();

		LOGGER.info(`Reading zip entry "calendar_dates.txt"...`);

		const parseEachRow = async (data: GTFS_CalendarDate_Raw) => {
			//

			//
			// Validate the current row against the proper type

			const validatedData = validateGtfsCalendarDate(data);

			//
			// Skip if this row's date is not between the given start and end dates

			if (validatedData.date < startDate || validatedData.date > endDate) return;

			//
			// If we're here, it means the service_id is valid between the given dates.
			// Get the previously saved calendars and check if it exists for this service_id.

			const savedCalendar = context.writers.savedCalendarDates.get(validatedData.service_id);

			if (savedCalendar) {
				// Create a new Set to avoid duplicated dates
				const updatedCalendar = new Set(savedCalendar);
				// If this service_id was previously saved, either add or remove the current date
				// to it based on the exception_type value for this row.
				if (validatedData.exception_type === 1) {
					updatedCalendar.add(validatedData.date);
					context.counters.calendarDates++;
				}
				else if (validatedData.exception_type === 2) {
					updatedCalendar.delete(validatedData.date);
					context.counters.calendarDates--;
				}
				// Update the service_id with the new dates
				context.writers.savedCalendarDates.set(validatedData.service_id, Array.from(updatedCalendar));
			}
			else {
				// If this is the first time we're seeing this service_id, then it is only necessary
				// to initiate a new dates array if it is a service addition
				if (validatedData.exception_type === 1) {
					context.writers.savedCalendarDates.set(validatedData.service_id, [validatedData.date]);
					context.counters.calendarDates++;
				}
			}

			//
		};

		//
		// Setup the CSV parsing operation only if the file exists

		if (fs.existsSync(`${context.workdir.extractDirPath}/calendar_dates.txt`)) {
			await parseCsvFile(`${context.workdir.extractDirPath}/calendar_dates.txt`, parseEachRow);
			LOGGER.success(`Finished processing "calendar_dates.txt": ${context.writers.savedCalendarDates.size} rows saved in ${calendarDatesParseTimer.get()}.`, 1);
		}
		else {
			LOGGER.info(`Optional file "calendar_dates.txt" not found. This may or may not be an error. Proceeding...`, 1);
		}

		//
	}
	catch (error) {
		LOGGER.error('Error processing "calendar_dates.txt" file.', error);
		throw new Error('✖︎ Error processing "calendar_dates.txt" file.');
	}
}

/* * */
/* PARSE TRIPS.TXT */
async function processTripsFile(context: Context): Promise<void> {
	//
	// Next up: trips.txt
	// Now that the calendars are sorted out, the jobs is easier for the trips.
	// Only include trips which have the referenced service IDs saved before.

	try {
		//

		const tripsParseTimer = new TIMETRACKER();

		LOGGER.info(`Reading zip entry "trips.txt"...`);

		const parseEachRow = async (data: GTFS_Trip_Extended_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsTripExtended(data);
			// For each trip, check if the associated service_id was saved
			// in the previous step or not. Include it if yes, skip otherwise.
			if (!context.writers.savedCalendarDates.has(validatedData.service_id)) return;
			// Save the exported row
			context.writers.savedTrips.write(validatedData);
			// Reference the associated entities to filter them later.
			context.referencedRouteIds.add(validatedData.route_id);
			context.referencedShapeIds.add(validatedData.shape_id);
			// Log progress
			if (context.counters.trips % 10000 === 0) LOGGER.info(`Parsed ${context.counters.trips} trips.txt rows so far.`);
			// Increment the counter
			context.counters.trips++;
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${context.workdir.extractDirPath}/trips.txt`, parseEachRow);

		context.writers.savedTrips.flush();

		LOGGER.success(`Finished processing "trips.txt": ${context.writers.savedTrips.size} rows saved in ${tripsParseTimer.get()}.`, 1);

		//
	}
	catch (error) {
		LOGGER.error('Error processing "trips.txt" file.', error);
		throw new Error('✖︎ Error processing "trips.txt" file.');
	}
}

/* * */
/* PARSE ROUTES.TXT */
async function processRoutesFile(context: Context): Promise<void> {
	//
	// Next up: routes.txt
	// For routes, only include the ones referenced in the filtered trips.

	try {
		//

		const routesParseTimer = new TIMETRACKER();

		LOGGER.info(`Reading zip entry "routes.txt"...`);

		const parseEachRow = async (data: GTFS_Route_Extended_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsRouteExtended(data);
			// For each route, only save the ones referenced
			// by the previously saved trips.
			if (!context.referencedRouteIds.has(validatedData.route_id)) return;
			// Save the exported row
			context.writers.savedRoutes.write(validatedData);
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${context.workdir.extractDirPath}/routes.txt`, parseEachRow);

		context.writers.savedRoutes.flush();

		LOGGER.success(`Finished processing "routes.txt": ${context.writers.savedRoutes.size} rows saved in ${routesParseTimer.get()}.`, 1);

		//
	}
	catch (error) {
		LOGGER.error('Error processing "routes.txt" file.', error);
		throw new Error('✖︎ Error processing "routes.txt" file.');
	}
}

/* * */
/* PARSE SHAPES.TXT */
async function processShapesFile(context: Context): Promise<void> {
	//
	// Next up: shapes.txt
	// Do a similiar check as the previous step.
	// Only include the shapes for trips referenced before.

	try {
		//

		const shapesParseTimer = new TIMETRACKER();

		LOGGER.info(`Reading zip entry "shapes.txt"...`);

		const parseEachRow = async (data: GTFS_Shape_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsShape(data);
			// For each route, only save the ones referenced
			// by the previously saved trips.
			if (!context.referencedShapeIds.has(validatedData.shape_id)) return;
			// Save the exported row
			context.writers.savedShapes.write(validatedData);
			// Log progress
			if (context.counters.shapes % 100000 === 0) LOGGER.info(`Parsed ${context.counters.shapes} shapes.txt rows so far.`);
			// Increment the counter
			context.counters.shapes++;
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${context.workdir.extractDirPath}/shapes.txt`, parseEachRow);

		context.writers.savedShapes.flush();

		LOGGER.success(`Finished processing "shapes.txt": ${context.writers.savedShapes.size} rows saved in ${shapesParseTimer.get()}.`, 1);

		//
	}
	catch (error) {
		LOGGER.error('Error processing "shapes.txt" file.', error);
		throw new Error('✖︎ Error processing "shapes.txt" file.');
	}
}

/* * */
/* PARSE STOPS.TXT */
async function processStopsFile(context: Context): Promise<void> {
	//
	// Next up: stops.txt
	// For stops, include all of them since we don't have a way to filter them yet like trips/routes/shapes.
	// By saving all of them, we also speed up the processing of each stop_time by including the stop data right away.

	try {
		//

		const stopsParseTimer = new TIMETRACKER();

		LOGGER.info(`Reading zip entry "stops.txt"...`);

		const parseEachRow = async (data: GTFS_Stop_Extended_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsStopExtended(data);
			// Skip if stop already exists
			if (context.writers.savedStops.get('stop_id', validatedData.stop_id)) return;
			// Save the exported row
			context.writers.savedStops.write(validatedData);
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${context.workdir.extractDirPath}/stops.txt`, parseEachRow);

		context.writers.savedStops.flush();

		LOGGER.success(`Finished processing "stops.txt": ${context.writers.savedStops.size} rows saved in ${stopsParseTimer.get()}.`, 1);

		//
	}
	catch (error) {
		LOGGER.error('Error processing "stops.txt" file.', error);
		throw new Error('✖︎ Error processing "stops.txt" file.');
	}
}

/* * */
/* PARSE STOP_TIMES.TXT */
async function processStopTimesFile(context: Context): Promise<void> {
	//
	// Next up: stop_times.txt
	// Do a similiar check as the previous steps. Only include the stop_times for trips referenced before.
	// Since this is the most resource intensive operation of them all, include the associated stop data
	// right away to avoid another lookup later.

	try {
		//

		const stopTimesParseTimer = new TIMETRACKER();

		LOGGER.info(`Reading zip entry "stop_times.txt"...`);

		const parseEachRow = async (data: GTFS_StopTime_Raw) => {
			// Validate the current row against the proper type
			const validatedData = validateGtfsStopTime(data);
			// Skip if this row's trip_id was not saved before.
			const tripData = context.writers.savedTrips.get('trip_id', validatedData.trip_id);
			if (!tripData) return;
			// Also, check if the stop_id is valid and was saved before.
			const stopData = context.writers.savedStops.get('stop_id', validatedData.stop_id);
			if (!stopData) return;
			// Save the exported row
			context.writers.savedStopTimes.write(validatedData);
			// Log progress
			if (context.counters.stopTimes % 100000 === 0) LOGGER.info(`Parsed ${context.counters.stopTimes} stop_times.txt rows so far.`);
			// Increment the counter
			context.counters.stopTimes++;
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${context.workdir.extractDirPath}/stop_times.txt`, parseEachRow);

		context.writers.savedStopTimes.flush();

		LOGGER.success(`Finished processing "stop_times.txt": ${context.counters.stopTimes} rows saved in ${stopTimesParseTimer.get()}.`, 1);

		//
	}
	catch (error) {
		LOGGER.error('Error processing "stop_times.txt" file.', error);
		throw new Error('✖︎ Error processing "stop_times.txt" file.');
	}
}

/* * */
/* MAIN FUNCTION */

export async function importGtfsToDatabase(plans: Plan[], config: ImportGtfsToDatabaseConfig = {}): Promise<GtfsSQLWriters> {
	try {
		const globalTimer = new TIMETRACKER();

		LOGGER.info(`Importing ${plans.length} GTFS to database...`);

		const sqlWriters = intializeSQLWriters();

		for (const [planIndex, planData] of plans.entries()) {
			// Initialize context for the current plan
			const context: Context = {
				counters: { calendarDates: 0, hashedShapes: 0, hashedTrips: 0, shapes: 0, stopTimes: 0, trips: 0 },
				planData: planData,
				referencedRouteIds: new Set<string>(),
				referencedShapeIds: new Set<string>(),
				workdir: await downloadAndExtractGtfs(planData),
				writers: sqlWriters,
			};

			// Process GTFS files in the correct order
			const { endDate, startDate } = config;

			await processCalendarFile(context, startDate ?? planData.gtfs_feed_info.feed_start_date, endDate ?? planData.gtfs_feed_info.feed_end_date);
			await processCalendarDatesFile(context, startDate ?? planData.gtfs_feed_info.feed_start_date, endDate ?? planData.gtfs_feed_info.feed_end_date);

			/* * */
			await processTripsFile(context);
			await processRoutesFile(context);
			await processShapesFile(context);
			await processStopsFile(context);
			await processStopTimesFile(context);

			LOGGER.success(`[${planIndex + 1}/${plans.length}] - Finished importing GTFS to database for plan "${planData._id}" in ${globalTimer.get()}.`, 0);
			LOGGER.divider();
		}

		LOGGER.terminate(`Finished importing ${plans.length} GTFS to database in ${globalTimer.get()}.`);

		return sqlWriters;
	}
	catch (error) {
		LOGGER.error('Error parsing plan.', error);
		throw error;
	}
}
