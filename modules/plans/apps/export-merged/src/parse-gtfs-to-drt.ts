/* * */

import { GTFS_Route_Extended, GTFS_StopTime, GTFS_Trip_Extended, Plan } from '@go/types';
import { toMetersFromKilometersOrMeters } from '@go/geo';
import { SQLiteDatabase, SQLiteTableInstance } from '@go/utils-sqlite';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';

import { DrtJourneys, DrtPatternPoints, DrtPatterns, DrtPatternStops, DrtRoutes, DrtStops } from './drt.types.js';
import { GtfsSQLTables } from './import-gtfs-to-database.js';

/* * */

export interface DrtTables {
	journeys: SQLiteTableInstance<DrtJourneys>
	patternPoints: SQLiteTableInstance<DrtPatternPoints>
	patterns: SQLiteTableInstance<DrtPatterns>
	patternStops: SQLiteTableInstance<DrtPatternStops>
	routes: SQLiteTableInstance<DrtRoutes>
	stops: SQLiteTableInstance<DrtStops>
}

interface Context {
	database: InstanceType<typeof SQLiteDatabase>
	gtfs: GtfsSQLTables
	plan: Plan
	tables: DrtTables
}

/* * */

/* * */
/* MAIN FUNCTION */
export async function parseGtfsToDrt(options: Context) {
	try {
		const globalTimer = new TIMETRACKER();

		LOGGER.title(`Converting GTFS to DRT Schema...`);

		//
		//
		// Initialize Context, Database and Tables
		const context: Context = { ...options };

		//
		LOGGER.terminate(`Finished GTFS to DRT Schema in ${globalTimer.get()}.`);

		//
		// Parse Stops and Routes first, because they are independent of the other tables
		await parseStops(context);
		await parseRoutes(context);

		//
		// These will stay together because they are related to the same trip
		for (const [index, currentTrip] of context.gtfs.trips.all().entries()) {
			//

			//
			// Log every 10000 rides processed

			if (index % 1000 === 0) LOGGER.info(`Processing Trip ${index} of ${context.gtfs.trips.size}`);

			//
			// Get associated data from previously saved entities,
			// as well as other commonly used variables in the next steps.

			const selectedCalendarDate = context.gtfs.calendarDates.get(currentTrip.service_id);
			const selectedStopTime = context.gtfs.stopTimes.all('WHERE trip_id = ? ORDER BY stop_sequence ASC', [currentTrip.trip_id]);
			const selectedRoute = context.gtfs.routes.get('route_id', currentTrip.route_id);
			const selectedShape = context.gtfs.shapes.all('WHERE shape_id = ?', [currentTrip.shape_id]);

			//
			// Validate the required data for this trip
			// to prevent errors later on.

			if (!selectedCalendarDate || selectedCalendarDate.length === 0) {
				LOGGER.error(`Trip "${currentTrip.trip_id}" has no calendar dates. Skipping...`);
				continue;
			}

			if (!selectedStopTime || selectedStopTime.length === 0) {
				LOGGER.error(`Trip "${currentTrip.trip_id}" has no stop_times data. Skipping...`);
				continue;
			}

			if (!selectedRoute) {
				LOGGER.error(`Trip "${currentTrip.trip_id}" has no route data. Skipping...`);
				continue;
			}

			if (!selectedShape || selectedShape.length === 0) {
				LOGGER.error(`Trip "${currentTrip.trip_id}" has no shape data. Skipping...`);
				continue;
			}

			//
			// Extract commonly used variables use in the next steps
			// to avoid repeated lookups and calculations.

			const sortedStopTimesData = selectedStopTime?.sort((a, b) => a.stop_sequence - b.stop_sequence);
			const lastStopTime = sortedStopTimesData[sortedStopTimesData.length - 1];

			// Parse Pattern Stops (HASHED TRIPS)
			await parsePatternStops(context, selectedStopTime, lastStopTime);

			// Parse Pattern Points (HASHED SHAPES)
			await parsePatternPoints(context, selectedStopTime, lastStopTime);

			// Parse Patterns
			await parsePatterns(context, currentTrip, selectedStopTime);

			// Parse Journeys
			await parseJourneys(context, currentTrip, selectedRoute, selectedStopTime);
		}

		LOGGER.success(`Finished converting GTFS to DRT Schema in ${globalTimer.get()}.`, 1);
		return;
	}
	catch (error) {
		LOGGER.error('Error converting GTFS to DRT Schema.', error);
		throw error;
	}
}

/* * */
/* ====== PARSERS ====== */
/* * */

/* * */
/* PARSE STOPS */
async function parseStops(context: Context) {
	//
	//

	try {
		//

		for (const stop of context.gtfs.stops.all()) {
			const drtStop: DrtStops = {
				bench: stop.has_bench.toString(),
				entrance_restriction: '',
				equipment: '',
				exit_restriction: '',
				location_type: stop.location_type,
				municipality: stop.municipality_id,
				municipality_fare_1: '',
				municipality_fare_2: '',
				network_map: stop.has_network_map.toString(),
				observations: '',
				operation_plan_id: context.plan._id,
				operator_id: isNaN(Number(context.plan.gtfs_agency.agency_id)) ? 0 : Number(context.plan.gtfs_agency.agency_id),
				parent_station: stop.parent_station,
				platform_code: stop.platform_code,
				preservation_state: '',
				real_time_information: stop.has_pip_real_time.toString(),
				region: stop.region_id,
				schedule: stop.has_schedules.toString(),
				shelter: stop.has_shelter.toString(),
				signalling: stop.has_stop_sign.toString(),
				slot: '',
				stop_code: stop.stop_code,
				stop_desc: stop.stop_desc,
				stop_id: stop.stop_id,
				stop_lat: stop.stop_lat,
				stop_lng: stop.stop_lon,
				stop_name: stop.stop_name,
				stop_timezone: stop.stop_timezone,
				stop_url: stop.stop_url,
				tariff: stop.has_tariffs_information.toString(),
				wheelchair_boarding: stop.wheelchair_boarding.toString(),
				zone_shift: stop.zone_id,
			};

			context.tables.stops.write(drtStop);
		}

		context.tables.stops.flush();
	}
	catch (error) {
		LOGGER.error('Error parsing GTFS stops.', error);
		throw error;
	}
}

/* * */
/* PARSE ROUTES */
async function parseRoutes(context: Context) {
	//
	//

	try {
		//

		for (const route of context.gtfs.routes.all()) {
			const drtRoute: DrtRoutes = {
				continuous_drop_off: route.continuous_drop_off,
				continuous_pickup: route.continuous_pickup,
				direction_id: 0,
				line_id: route.line_id.toString(),
				line_long_name: route.line_long_name,
				line_short_name: route.line_short_name,
				operation_plan_id: context.plan._id,
				operator_id: isNaN(Number(context.plan.gtfs_agency.agency_id)) ? 0 : Number(context.plan.gtfs_agency.agency_id),
				pattern_id: '',
				route_color: route.route_color,
				route_desc: route.route_desc,
				route_destination: '',
				route_id: route.route_id,
				route_long_name: route.route_long_name,
				route_origin: '',
				route_short_name: route.route_short_name,
				route_sort_order: route.route_sort_order,
				route_text_color: route.route_text_color,
				route_url: route.route_url,
				sample_trip_id: '',
				school: route.school,
				variant_description: route.route_remarks,
				variant_name: route.route_short_name,
			};

			context.tables.routes.write(drtRoute);
		}

		context.tables.routes.flush();
	}
	catch (error) {
		LOGGER.error('Error parsing GTFS routes.', error);
		throw error;
	}
}

/* * */
/* PARSE PATTERNS */
async function parsePatterns(context: Context, selectedTrip: GTFS_Trip_Extended, stopTimesData: GTFS_StopTime[]) {
	//
	//
	//

	try {
		//

		for (const stopTime of stopTimesData) {
			const drtPattern: DrtPatterns = {
				encoded_path: '',
				end_stop_code: stopTime.stop_id,
				metric: 0,
				operation_plan_id: context.plan._id,
				operator_id: isNaN(Number(context.plan.gtfs_agency.agency_id)) ? 0 : Number(context.plan.gtfs_agency.agency_id),
				pattern_id: selectedTrip.pattern_id,
				serial_id: 0,
				start_stop_code: stopTime.stop_id,
			};

			context.tables.patterns.write(drtPattern);
		}

		context.tables.patterns.flush();
	}
	catch (error) {
		LOGGER.error('Error parsing GTFS patterns.', error);
		throw error;
	}
}

/* * */
/* PARSE PATTERN POINTS (HASHED SHAPES) */
async function parsePatternPoints(context: Context, stopTimesData: GTFS_StopTime[], lastStopTime: GTFS_StopTime) {
	try {
		//

		//
		// Build the HashedTrip data, including formatting the path data by combining
		// properties from stop_times and stops. Sort it by stop_sequence.

		for (const [index, stopTime] of stopTimesData.entries()) {
			//

			//
			// Get the stop data for this stop_time
			const stopData = context.gtfs.stops.get('stop_id', stopTime.stop_id);
			if (!stopData) throw new Error(`Stop "${stopTime.stop_id}" not found for trip "${context.gtfs.trips.get('trip_id', stopTime.trip_id)?.trip_id}" for Plan "${context.plan._id}".`);

			//
			// Normalize the shape_dist_traveled to meters, if necessary
			// ! WARNING: We are assuming that stopTimesData is sorted by stop_sequence
			const normalizedShapeDistFromPreviousStop = index === 0 ? 0 : toMetersFromKilometersOrMeters(stopTimesData[index - 1].shape_dist_traveled, lastStopTime.shape_dist_traveled);
			const normalizedShapeDistFromStart = index === 0 ? 0 : toMetersFromKilometersOrMeters(stopTime.shape_dist_traveled, lastStopTime.shape_dist_traveled);

			const normalizedShapeDistToNextStop = index === stopTimesData.length - 1 ? 0 : toMetersFromKilometersOrMeters(stopTimesData[index + 1].shape_dist_traveled, lastStopTime.shape_dist_traveled);
			const normalizedShapeDistToEnd = index === stopTimesData.length - 1 ? 0 : toMetersFromKilometersOrMeters(stopTimesData[index + 1].shape_dist_traveled, lastStopTime.shape_dist_traveled);

			//
			// Return the formatted path data for this stop_time

			const drtPatternStop: DrtPatternPoints = {
				is_stop: true,
				is_waypoint: true,
				lat: stopData.stop_lat,
				lng: stopData.stop_lon,
				meters_from_previous_stop: normalizedShapeDistFromPreviousStop,
				meters_from_start: normalizedShapeDistFromStart,
				meters_to_end: normalizedShapeDistToEnd,
				meters_to_next_stop: normalizedShapeDistToNextStop,
				operation_plan_id: context.plan._id,
				operator_id: isNaN(Number(context.plan.gtfs_agency.agency_id)) ? 0 : Number(context.plan.gtfs_agency.agency_id),
				ordinal: stopTime.stop_sequence,
				pattern_id: context.gtfs.trips.get('trip_id', stopTime.trip_id)?.pattern_id,
				stop_code: stopData.stop_code,
				stop_name: stopData.stop_name,
			};

			context.tables.patternPoints.write(drtPatternStop);
		}

		context.tables.patternPoints.flush();
	}
	catch (error) {
		LOGGER.error('Error parsing GTFS pattern stops.', error);
		throw error;
	}
}

/* * */
/* PARSE PATTERN STOPS (HASHED TRIPS) */
async function parsePatternStops(context: Context, stopTimesData: GTFS_StopTime[], lastStopTime: GTFS_StopTime) {
	try {
		//

		//
		// Build the HashedTrip data, including formatting the path data by combining
		// properties from stop_times and stops. Sort it by stop_sequence.

		for (const [index, stopTime] of stopTimesData.entries()) {
			//

			//
			// Get the stop data for this stop_time
			const stopData = context.gtfs.stops.get('stop_id', stopTime.stop_id);
			if (!stopData) throw new Error(`Stop "${stopTime.stop_id}" not found for trip "${context.gtfs.trips.get('trip_id', stopTime.trip_id)?.trip_id}" for Plan "${context.plan._id}".`);

			//
			// Normalize the shape_dist_traveled to meters, if necessary
			// ! WARNING: We are assuming that stopTimesData is sorted by stop_sequence
			const normalizedShapeDistFromPreviousStop = index === 0 ? 0 : toMetersFromKilometersOrMeters(stopTimesData[index - 1].shape_dist_traveled, lastStopTime.shape_dist_traveled);
			const normalizedShapeDistFromStart = index === 0 ? 0 : toMetersFromKilometersOrMeters(stopTime.shape_dist_traveled, lastStopTime.shape_dist_traveled);

			const normalizedShapeDistToNextStop = index === stopTimesData.length - 1 ? 0 : toMetersFromKilometersOrMeters(stopTimesData[index + 1].shape_dist_traveled, lastStopTime.shape_dist_traveled);
			const normalizedShapeDistToEnd = index === stopTimesData.length - 1 ? 0 : toMetersFromKilometersOrMeters(stopTimesData[index + 1].shape_dist_traveled, lastStopTime.shape_dist_traveled);

			//
			// Return the formatted path data for this stop_time

			const drtPatternStop: DrtPatternStops = {
				fare_info: '',
				lat: stopData.stop_lat,
				lng: stopData.stop_lon,
				meters_from_previous_stop: normalizedShapeDistFromPreviousStop,
				meters_from_start: normalizedShapeDistFromStart,
				meters_to_end: normalizedShapeDistToEnd,
				meters_to_next_stop: normalizedShapeDistToNextStop,
				operation_plan_id: context.plan._id,
				operator_id: isNaN(Number(context.plan.gtfs_agency.agency_id)) ? 0 : Number(context.plan.gtfs_agency.agency_id),
				ordinal: stopTime.stop_sequence,
				pattern_id: context.gtfs.trips.get('trip_id', stopTime.trip_id)?.pattern_id,
				stop_code: stopData.stop_code,
				stop_headsign: stopTime.stop_headsign,
				stop_name: stopData.stop_name,
				stop_sequence: stopTime.stop_sequence,
			};

			context.tables.patternStops.write(drtPatternStop);
		}

		context.tables.patternStops.flush();
	}
	catch (error) {
		LOGGER.error('Error parsing GTFS pattern stops.', error);
		throw error;
	}
}

/* * */
/* PARSE JOURNEYS */
async function parseJourneys(context: Context, selectedTrip: GTFS_Trip_Extended, routeData: GTFS_Route_Extended, stopTimesData: GTFS_StopTime[]) {
	//
	//

	try {
		//

		//
		// Get the first and last stop times for this trip
		const firstStopTime = stopTimesData[0];
		const lastStopTime = stopTimesData[stopTimesData.length - 1];

		//
		// Get Calendar Dates Data for this trip
		const calendarDatesData = context.gtfs.calendarDates.get(selectedTrip.service_id);

		//
		// For Each Operational Date of this trip, create a Journey document
		for (const operationalDate of calendarDatesData) {
			const drtJourney: DrtJourneys = {
				block_id: '',
				da_trip_number: 0,
				date: operationalDate,
				day_type_id: 0,
				direction_id: 0,
				end_arrival_time: lastStopTime.arrival_time,
				end_shift_id: '',
				end_stop_id: lastStopTime.stop_id,
				end_stop_sequence: lastStopTime.stop_sequence,
				holiday: 0,
				journey_id: 0,
				journey_metric: 0,
				line_id: routeData.line_id.toString(),
				line_long_name: routeData.line_long_name,
				line_short_name: routeData.line_short_name,
				operation_plan_id: context.plan._id,
				operator_id: isNaN(Number(context.plan.gtfs_agency.agency_id)) ? 0 : Number(context.plan.gtfs_agency.agency_id),
				pattern_id: selectedTrip.pattern_id,
				pattern_short_name: '',
				period: 0,
				route_desc: routeData.route_desc,
				route_destination: lastStopTime.stop_headsign,
				route_id: selectedTrip.route_id,
				route_long_name: routeData.route_long_name,
				route_origin: firstStopTime.stop_headsign,
				route_short_name: routeData.route_short_name,
				run_type: '',
				shape_id: selectedTrip.shape_id,
				start_departure_time: firstStopTime.departure_time,
				start_shift_id: '',
				start_stop_id: firstStopTime.stop_id,
				start_stop_sequence: firstStopTime.stop_sequence,
				trip_headsign: selectedTrip.trip_headsign,
				trip_id: selectedTrip.trip_id,
				trip_short_name: selectedTrip.trip_short_name,
				va_trip_number: 0,
			};

			context.tables.journeys.write(drtJourney);
		}

		context.tables.journeys.flush();
	}
	catch (error) {
		LOGGER.error('Error parsing GTFS journeys.', error);
		throw error;
	}
}
