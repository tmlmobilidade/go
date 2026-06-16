/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Route_Extended, type HubLine, type HubPattern, type HubRoute, type HubScheduledArrival, type HubStop, type HubTrip, type HubWaypoint } from '@tmlmobilidade/types';
import crypto from 'node:crypto';

/* * */

export async function generateLinesRoutesPatterns(importedGtfsSql: GtfsSQLTables) {
	//

	/* * *
	 * INTRODUCTION
	 *
	 * The goal of this script is to parse one GTFS feed into a cohesive and intuitive JSON representation.
	 * GTFS feeds are notoriously big and contain a lot of duplicated data, which maybe makes sense for GTFS
	 * but for an API might be too expensive. Therefore, here we try to condense the information, reducing duplication,
	 * by structuring network data into three main levels:
	 * (1) The first level is the line, which is the highest level grouping, usually indentified by a 4 digit ID.
	 * A line does not have schedules or path, since it represents a <group> of similar routes and patterns that serve
	 * an area with a given intent.
	 * (2) The second level is the route. There is no hard limit on how many routes one line can have, but there is effort
	 * to keep this number low. The route is identified by the 4 digits of the parent line_id followed by an underscore
	 * and a zero based index. For example, line_id 1234 would have routes 1234_0, 1234_1, etc. A route also has no schedules
	 * or path, but it contains references to child patterns that actually describe the available service.
	 * (3) The pattern is a logic representation of a direction of a route. One route can have at most two patterns, one for each direction.
	 * A pattern is built from the unique combination of trips with the same route_id, direction_id, trip_headsign, shape_id and stop_sequence.
	 * It is important to note that the pattern is not part of the GTFS standard, but a common way to structure network data in a logical
	 * and familiar way for passengers. In the current iteration of this API, it is sometimes necessary to create multiple versions of the same patten,
	 * in order to be able to present the evolution of the network. For example, a pattern may change shape or stops starting next month,
	 * and both versions need to be available for the consumers of this API. This is why one pattern can actually have multiple pattern groups.
	 * (3.1) One pattern group represents a particular version of that pattern. All pattern groups have the same pattern ID (which is composed
	 * of the parent route ID followed by an underscore and the direction ID of the GTFS trips used to build it) but each group is valid on a different
	 * set of dates. This is what should control the pattern group visibility in a frontend application. It is the pattern group that has a path,
	 * an associated shape and a set of schedules for each serviced stop.
	 * (4) In GTFS, trips are the atomic unit of service. They represent a given sequence of stops serviced on a particular time on set of dates.
	 * In this API, we group trips into schedules, which are all the GTFS trips that serve a path at the same time. For example, the 9h trip
	 * in a given direction can be found in the GTFS "separated" into 3 distinct trips, since each can have a different associated calendar (set of dates).
	 * While this allows for great flexibility in the GTFS format, it makes it hard to consume for users. By grouping trips into schedules,
	 * we simplify consumption while improving service readability as a whole. A schedule represents all trips serving the same path at the same time.
	 */

	Logger.title(`Sync Lines, Routes and Patterns`);
	const globalTimer = new Timer();

	//
	// Build hashmaps for GTFS entities that will be reused multiple times.
	// Using hashmaps allows for O(1) lookups instead of linear scans.

	const fetchRawDataTimer = new Timer();

	// For Stops
	const allStopsParsedTxt = await apiCache.get('hub:v1:network:stops');
	const allStopsParsedJson: HubStop[] = JSON.parse(allStopsParsedTxt);
	const allStopsParsedMap = new Map(allStopsParsedJson.map(item => [item._id, item]));

	// For Routes
	const allRoutesRaw = importedGtfsSql.routes.all();
	const allRoutesRawMap = new Map<string, GTFS_Route_Extended>(allRoutesRaw.map(item => [item.route_id, item]));

	// Get all distinct Pattern IDs from trips table
	const allDistinctPatternIds = importedGtfsSql.trips.distinct('pattern_id');

	Logger.info(`Fetched ${allDistinctPatternIds.length} rows from GTFS (${fetchRawDataTimer.get()})`);

	//
	// For each distinct pattern_id, parse trips into patterns and schedules.
	// GTFS is built with trips as the central point holding most other entities together.
	// By starting with trips, we can easily extract the patterns, route and line for the whole network,
	// while keeping memory use low by processing one pattern at a time.

	const processPatternsTimer = new Timer();

	const allLinesParsed = new Map<string, HubLine>();
	const allRoutesParsed = new Map<string, HubRoute>();
	const updatedPatternKeys = new Set<string>();

	for (const patternId of allDistinctPatternIds) {
		//

		//
		// Get all trips that match the current pattern ID

		const allTripsForThisPatternRaw = importedGtfsSql.trips.all('WHERE pattern_id = ?', [patternId]);

		//
		// Setup a variable to hold the parsed pattern groups

		const parsedPatternsForThisPatternGroup = new Map<string, HubPattern>();

		//
		// For each trip belonging to the current pattern ID,
		// build the actual pattern groups, merge trips with the saved path and arrival times,
		// and create the higher level route and line objects.

		for (const tripRawData of allTripsForThisPatternRaw) {
			//

			//
			// Get the stop_times data associated with the current trip

			const stopTimesRaw = importedGtfsSql.stop_times.all(`WHERE trip_id = ? ORDER BY stop_sequence`, [tripRawData.trip_id]);

			//
			// With the same set of data (stop_times sequence of stops) we can find out different information.
			// By creating a simplified version of path (just Stop IDs) we can detect different itineraries for the same pattern,
			// and this is used to differentiate pattern versions. The service ID associated with those trips dictactes when
			// this pattern group is valid. The complete path is the one actually saved to the database, since it has full stop details
			// and pickup and dropoff types. To detect trips with the same arrival times at every stop of the path the schedule version is used.
			// These trips are exactly the same, but they have different associated calendars. Depending on the source of the file, or the amount
			// of information associated with each trip, this may be more or less evident. Take the case where the 9h trip happens every day of the year,
			// but there is a need to associate different drivers or vehicles (blocks) to each trip, therefore creating the need to separate each run
			// into multiple trips, each with its own calendar. GTFS motivates this separation to allow for flexibility, but it makes for a lot of duplication.
			// By grouping trips with the same schedules we aim to simplify that consumption. Each trip_id is still available to be matched with
			// GTFS-RT feeds if necessary. Also note that, if the 9h trip is faster in the summer than in the winter, that is also caught here, since all
			// arrival times need to be the same for all stops in the path. Finally, each stop in the path has an associated set of facilities served,
			// a locality and a municipality ID. Instead of running these loops multiple times, we run it once and save all the necessary information immediately.

			const stopTimesAsSimplifiedPath: { id: string, stop_sequence: number }[] = [];
			const stopTimesAsCompletePath: HubWaypoint[] = [];

			const stopTimesAsSimplifiedSchedule: { arrival_time: string, stop_id: string, stop_sequence: number }[] = [];
			const stopTimesAsCompleteSchedule: HubScheduledArrival[] = [];

			const facilitiesList = new Set<string>();

			const districtIdsList = new Set<string>();
			const districtNamesList = new Set<string>();
			const municipalityIdsList = new Set<string>();
			const municipalityNamesList = new Set<string>();
			const parishIdsList = new Set<string>();
			const parishNamesList = new Set<string>();
			const localityIdsList = new Set<string>();
			const localityNamesList = new Set<string>();

			//

			for (const stopTimeRawData of stopTimesRaw) {
				//

				//
				// Get the stop data associated with the current stop_time

				const stopParsedData: HubStop = allStopsParsedMap.get(Number(stopTimeRawData.stop_id));
				if (!stopParsedData) {
					Logger.error(`Stop not found: ${stopTimeRawData.stop_id}`);
					continue;
				}

				//
				// Buld the simplified path with only the stop_id and stop_sequence.
				// This will be used to dictacte if this trip belongs to an existing or a new pattern group.

				stopTimesAsSimplifiedPath.push({
					id: stopTimeRawData.stop_id,
					stop_sequence: stopTimeRawData.stop_sequence,
				});

				//
				// Buld the complete path with stop details and service conditions.
				// This will be the path that is stored alongside this pattern group.

				stopTimesAsCompletePath.push({
					allow_drop_off: stopTimeRawData.drop_off_type !== 1, // Alight.NOT_AVAILABLE
					allow_pickup: stopTimeRawData.pickup_type !== 1, // Alight.NOT_AVAILABLE
					distance: Number(stopTimeRawData.shape_dist_traveled),
					distance_delta: 0,
					stop_id: stopTimeRawData.stop_id,
					stop_sequence: stopTimeRawData.stop_sequence,
				});

				//
				// Build the simplified schedule version with only arrival times at each stop.
				// This will be used to merge trips that are equal but happen on differnt dates.

				stopTimesAsSimplifiedSchedule.push({
					arrival_time: stopTimeRawData.arrival_time,
					stop_id: stopTimeRawData.stop_id,
					stop_sequence: stopTimeRawData.stop_sequence,
				});

				//
				// Build the complete schedule, with formatted time strings.
				// This will be the schedule that is stored alongside this trip group.

				stopTimesAsCompleteSchedule.push({
					arrival_time: stopTimeRawData.arrival_time,
					arrival_time_24h: transformOperationTimeStringIntoDisplayTimeString(stopTimeRawData.arrival_time),
					stop_id: stopTimeRawData.stop_id,
					stop_sequence: stopTimeRawData.stop_sequence,
				});

				//
				// Add the facilities served by the current stop to the list

				// stopParsedData.facilities.forEach(item => facilitiesList.add(item));

				//
				// Add the current stop location to the list

				if (stopParsedData.district_id) districtIdsList.add(stopParsedData.district_id);
				if (stopParsedData.district_name) districtNamesList.add(stopParsedData.district_name);
				if (stopParsedData.municipality_id) municipalityIdsList.add(stopParsedData.municipality_id);
				if (stopParsedData.municipality_name) municipalityNamesList.add(stopParsedData.municipality_name);
				if (stopParsedData.parish_id) parishIdsList.add(stopParsedData.parish_id);
				if (stopParsedData.parish_name) parishNamesList.add(stopParsedData.parish_name);
				if (stopParsedData.locality_id) localityIdsList.add(stopParsedData.locality_id);
				if (stopParsedData.locality_name) localityNamesList.add(stopParsedData.locality_name);

				//
			}

			//
			// Get the route data associated with this trip from the map

			const routeRawData = allRoutesRawMap.get(tripRawData.route_id);

			//
			// Create the pattern version object with only the fields used to differentiate between each version.
			// A pattern version is differentiated by the fields below, with special focus on direction_id,
			// trip_headsign, shape_id and the simplified version of path (stop_id and stop_sequence).
			// This means that everytime any of these fields differs, a new pattern version will be created,
			// and a different set of dates will be associated with it.

			const currentPatternGroup: Partial<HubPattern> = {
				_id: tripRawData.pattern_id,
				agency_id: routeRawData.agency_id,
				color: routeRawData.route_color ? `#${routeRawData.route_color}` : '#000000',
				direction_id: tripRawData.direction_id,
				headsign: tripRawData.trip_headsign,
				line_id: String(routeRawData.line_id),
				route_id: routeRawData.route_id,
				shape_id: tripRawData.shape_id,
				short_name: routeRawData.route_short_name,
				text_color: routeRawData.route_text_color,
			};

			//
			// Create a hash of the object to detect if this pattern version already exists

			const currentPatternVersionHash = crypto.createHash('sha256').update(JSON.stringify(currentPatternGroup)).digest('hex');

			//
			// Check if this pattern version already exists, and create if it doesn't.
			// The created pattern version will have all the complete information that was not used to differentiate between versions.

			let currentPatternObject: HubPattern;

			if (parsedPatternsForThisPatternGroup.has(currentPatternVersionHash)) {
				currentPatternObject = parsedPatternsForThisPatternGroup.get(currentPatternVersionHash);
			} else {
				currentPatternObject =	{
					_id: tripRawData.pattern_id,
					agency_id: routeRawData.agency_id,
					color: routeRawData.route_color ? `#${routeRawData.route_color}` : '#000000',
					direction_id: tripRawData.direction_id,
					district_ids: [],
					district_names: [],
					facilities: [],
					headsign: tripRawData.trip_headsign,
					line_id: String(routeRawData.line_id),
					locality_ids: [],
					locality_names: [],
					long_name: routeRawData.line_long_name,
					municipality_ids: [],
					municipality_names: [],
					parish_ids: [],
					parish_names: [],
					path: stopTimesAsCompletePath,
					route_id: routeRawData.route_id,
					shape_id: tripRawData.shape_id,
					short_name: routeRawData.line_short_name,
					text_color: routeRawData.route_text_color ? `#${routeRawData.route_text_color}` : '#000000',
					trips: [],
					tts_headsign: '',
					valid_on: [],
					version_id: currentPatternVersionHash,
				};
			}

			//
			// Add to the current pattern group (new or exising) the data retrieved from the current trip

			currentPatternObject.valid_on = Array.from(new Set([...importedGtfsSql.calendar_dates[tripRawData.service_id], ...currentPatternObject.valid_on]));
			currentPatternObject.facilities = Array.from(new Set([...currentPatternObject.facilities, ...facilitiesList]));

			currentPatternObject.district_ids = Array.from(new Set([...currentPatternObject.district_ids, ...districtIdsList]));
			currentPatternObject.district_names = Array.from(new Set([...currentPatternObject.district_names, ...districtNamesList]));
			currentPatternObject.municipality_ids = Array.from(new Set([...currentPatternObject.municipality_ids, ...municipalityIdsList]));
			currentPatternObject.municipality_names = Array.from(new Set([...currentPatternObject.municipality_names, ...municipalityNamesList]));
			currentPatternObject.parish_ids = Array.from(new Set([...currentPatternObject.parish_ids, ...parishIdsList]));
			currentPatternObject.parish_names = Array.from(new Set([...currentPatternObject.parish_names, ...parishNamesList]));
			currentPatternObject.locality_ids = Array.from(new Set([...currentPatternObject.locality_ids, ...localityIdsList]));
			currentPatternObject.locality_names = Array.from(new Set([...currentPatternObject.locality_names, ...localityNamesList]));

			//
			// Create a simplified version of this trip with the goal of finding the same trip,
			// with the same arrival times on all stops, but with different calendars.
			// Notice we're including the pattern group hash since the same trip cannot be present in different
			// pattern groups, as in they are contained in it. In other words, the uniqueness of a trip is dependent
			// on the pattern group it belongs to.

			const simplifiedTripGroup = {
				direction_id: tripRawData.direction_id,
				id: tripRawData.pattern_id,
				route_id: tripRawData.route_id,
				simplified_schedule: stopTimesAsSimplifiedSchedule,
				version_id: currentPatternVersionHash,
			};

			//
			// Create a hash of the object to detect if this trip group already exists

			const currentTripGroupHash = crypto.createHash('sha256').update(JSON.stringify(simplifiedTripGroup)).digest('hex');

			//
			// Check if this trip group already exists, and create if it doesn't.
			// The created trip group will have all the complete information not used to differentiate between groups.

			const allTripGroupsForThisPattern = new Map<string, HubTrip>();
			currentPatternObject.trips.forEach(item => allTripGroupsForThisPattern.set(item.version_id, item));

			let currentTripGroupObject: HubTrip;

			if (allTripGroupsForThisPattern.has(currentTripGroupHash)) {
				currentTripGroupObject = allTripGroupsForThisPattern.get(currentTripGroupHash);
			} else {
				currentTripGroupObject = {
					schedule: stopTimesAsCompleteSchedule,
					service_ids: [],
					trip_ids: [],
					valid_on: [],
					version_id: currentTripGroupHash,
				};
			}

			//
			// Add to the current trip group (new or exising) the data retrieved from the current trip

			currentTripGroupObject.valid_on = Array.from(new Set([...importedGtfsSql.calendar_dates[tripRawData.service_id], ...currentTripGroupObject.valid_on]));
			currentTripGroupObject.service_ids = Array.from(new Set([tripRawData.service_id, ...currentTripGroupObject.service_ids]));
			currentTripGroupObject.trip_ids = Array.from(new Set([tripRawData.trip_id, ...currentTripGroupObject.trip_ids]));

			allTripGroupsForThisPattern.set(currentTripGroupHash, currentTripGroupObject);

			currentPatternObject.trips = Array.from(allTripGroupsForThisPattern.values());

			//
			// Create the route object if it doesn't exist yet. Notice we're not using hashes here
			// because routes are supposed to be unique in the same GTFS file.

			let currentRouteObject: HubRoute;

			if (allRoutesParsed.has(tripRawData.route_id)) {
				currentRouteObject = allRoutesParsed.get(tripRawData.route_id);
			} else {
				currentRouteObject = {
					_id: routeRawData.route_id,
					agency_id: routeRawData.agency_id,
					color: routeRawData.route_color ? `#${routeRawData.route_color}` : '#000000',
					district_ids: [],
					district_names: [],
					facilities: [],
					line_id: String(routeRawData.line_id),
					locality_ids: [],
					locality_names: [],
					long_name: routeRawData.route_long_name,
					municipality_ids: [],
					municipality_names: [],
					parish_ids: [],
					parish_names: [],
					pattern_ids: [],
					short_name: routeRawData.route_short_name,
					stop_ids: [],
					text_color: routeRawData.route_text_color ? `#${routeRawData.route_text_color}` : '#FFFFFF',
					tts_name: '',
				};
			}

			//
			// Add to the current route (new or exising) the data retrieved from the current trip

			currentRouteObject.pattern_ids = Array.from(new Set([tripRawData.pattern_id, ...currentRouteObject.pattern_ids]));

			currentRouteObject.facilities = Array.from(new Set([...currentRouteObject.facilities, ...facilitiesList]));

			currentRouteObject.district_ids = Array.from(new Set([...currentRouteObject.district_ids, ...districtIdsList]));
			currentRouteObject.district_names = Array.from(new Set([...currentRouteObject.district_names, ...districtNamesList]));
			currentRouteObject.municipality_ids = Array.from(new Set([...currentRouteObject.municipality_ids, ...municipalityIdsList]));
			currentRouteObject.municipality_names = Array.from(new Set([...currentRouteObject.municipality_names, ...municipalityNamesList]));
			currentRouteObject.parish_ids = Array.from(new Set([...currentRouteObject.parish_ids, ...parishIdsList]));
			currentRouteObject.parish_names = Array.from(new Set([...currentRouteObject.parish_names, ...parishNamesList]));
			currentRouteObject.locality_ids = Array.from(new Set([...currentRouteObject.locality_ids, ...localityIdsList]));
			currentRouteObject.locality_names = Array.from(new Set([...currentRouteObject.locality_names, ...localityNamesList]));

			//
			// Create the line object if it doesn't exist yet

			let currentLineObject: HubLine;

			if (allLinesParsed.has(String(routeRawData.line_id))) {
				currentLineObject = allLinesParsed.get(String(routeRawData.line_id));
			} else {
				currentLineObject = {
					_id: String(routeRawData.line_id),
					agency_id: routeRawData.agency_id,
					color: routeRawData.route_color ? `#${routeRawData.route_color}` : '#000000',
					district_ids: [],
					district_names: [],
					facilities: [],
					locality_ids: [],
					locality_names: [],
					long_name: routeRawData.line_long_name,
					municipality_ids: [],
					municipality_names: [],
					parish_ids: [],
					parish_names: [],
					pattern_ids: [],
					route_ids: [],
					short_name: routeRawData.route_short_name,
					stop_ids: [],
					text_color: routeRawData.route_text_color ? `#${routeRawData.route_text_color}` : '#FFFFFF',
					tts_name: '',
				};
			}

			//
			// Add to the current line (new or exising) the data retrieved from the current trip

			currentLineObject.route_ids = Array.from(new Set([tripRawData.route_id, ...currentLineObject.route_ids]));
			currentLineObject.pattern_ids = Array.from(new Set([tripRawData.pattern_id, ...currentLineObject.pattern_ids]));

			currentLineObject.facilities = Array.from(new Set([...currentLineObject.facilities, ...facilitiesList]));

			currentLineObject.district_ids = Array.from(new Set([...currentLineObject.district_ids, ...districtIdsList]));
			currentLineObject.district_names = Array.from(new Set([...currentLineObject.district_names, ...districtNamesList]));
			currentLineObject.municipality_ids = Array.from(new Set([...currentLineObject.municipality_ids, ...municipalityIdsList]));
			currentLineObject.municipality_names = Array.from(new Set([...currentLineObject.municipality_names, ...municipalityNamesList]));
			currentLineObject.parish_ids = Array.from(new Set([...currentLineObject.parish_ids, ...parishIdsList]));
			currentLineObject.parish_names = Array.from(new Set([...currentLineObject.parish_names, ...parishNamesList]));
			currentLineObject.locality_ids = Array.from(new Set([...currentLineObject.locality_ids, ...localityIdsList]));
			currentLineObject.locality_names = Array.from(new Set([...currentLineObject.locality_names, ...localityNamesList]));

			//
			// Save the updated objects back to the maps

			allLinesParsed.set(String(routeRawData.line_id), currentLineObject);
			allRoutesParsed.set(routeRawData.route_id, currentRouteObject);
			parsedPatternsForThisPatternGroup.set(currentPatternVersionHash, currentPatternObject);

			//
		}

		//
		// After going through all the trips for the current pattern, the time comes to save them to the database.
		// However, a small modification is required. The pattern group contains a trips map that should be converted
		// to an array of trips. Also, the pattern groups themselves should be an array for the current pattern ID.

		const finalizedPatternGroupsData: HubPattern[] = Array.from(parsedPatternsForThisPatternGroup.values()).map((item: HubPattern) => ({ ...item, trips: Object.values(item.trips) }));

		await apiCache.set(`hub:v1:network:patterns:${patternId}`, JSON.stringify(finalizedPatternGroupsData));
		// await SERVERDB.set(SERVERDB_KEYS.NETWORK.PATTERNS.ID(patternId), JSON.stringify(finalizedPatternGroupsData));
		updatedPatternKeys.add(`hub:network:patterns:${patternId}`);

		// Logger.info(`Updated pattern_id "${patternId}" (${intraPatternTimer.get()})`);

		//
	}

	Logger.info(`Updated ${updatedPatternKeys.size} Patterns (${processPatternsTimer.get()})`);

	//
	// Delete stale patterns

	const removeStalePatternsTimer = new Timer();

	Logger.info(`Removing stale Patterns from cache...`);

	const allPatternKeysInTheDatabase = await apiCache.scan(`hub:network:patterns:*`);
	const stalePatternKeys = allPatternKeysInTheDatabase.filter(key => !updatedPatternKeys.has(key));
	if (stalePatternKeys.length) await apiCache.deleteMany(stalePatternKeys);

	Logger.info(`Deleted ${stalePatternKeys.length} stale Patterns (${removeStalePatternsTimer.get()})`);

	//
	// Save all routes to the database

	const finalizedAllRoutesData: HubRoute[] = Array.from(allRoutesParsed.values()).sort((a, b) => a._id.localeCompare(b._id, undefined, { numeric: true }));
	await apiCache.set('hub:v1:network:routes', JSON.stringify(finalizedAllRoutesData));
	Logger.info(`Updated ${finalizedAllRoutesData.length} Routes`);

	//
	// Save all lines to the database

	const finalizedAllLinesData: HubLine[] = Array.from(allLinesParsed.values()).sort((a, b) => a._id.localeCompare(b._id, undefined, { numeric: true }));
	await apiCache.set('hub:v1:network:lines', JSON.stringify(finalizedAllLinesData));
	Logger.info(`Updated ${finalizedAllLinesData.length} Lines`);

	//

	Logger.success(`Done updating Lines, Routes and Patterns (${globalTimer.get()})`);

	//
};

/* * */

function transformOperationTimeStringIntoDisplayTimeString(arrivalTimeString: string) {
	// Separate the string into time components [hours:minutes:seconds]
	const arrivalTimeComponents = arrivalTimeString.split(':');
	// Add a zero to the left of the hour component ( 3 -> 03 )
	let arrivalTimeComponentHour = arrivalTimeComponents[0].padStart(2, '0');
	// Check if the hour component is after midnight
	if (arrivalTimeComponentHour && Number(arrivalTimeComponentHour) >= 24) {
		// In this case, rebase it to a 24 hour clock
		const arrivalTimeComponentHourAdjusted = Number(arrivalTimeComponentHour) - 24;
		arrivalTimeComponentHour = String(arrivalTimeComponentHourAdjusted).padStart(2, '0');
	}
	// Add a zero to the left of minutes and seconds
	const arrivalTimeComponentMinutes = arrivalTimeComponents[1].padStart(2, '0');
	const arrivalTimeComponentSeconds = arrivalTimeComponents[2].padStart(2, '0');
	// Return formatted string
	return `${arrivalTimeComponentHour}:${arrivalTimeComponentMinutes}:${arrivalTimeComponentSeconds}`;
	//
}
