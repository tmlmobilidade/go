/* * */

import { getQualifiedLineId } from '@tmlmobilidade/go-hub-pckg-utils';
import { type EncodedPolyline } from '@tmlmobilidade/go-types-geo';
import { type HubV1ApiPattern, type HubV1ApiPatternTrip, type HubV1GtfsRoutes, type HubV1GtfsTrips } from '@tmlmobilidade/go-types-hub';
import { HexColorSchema, type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import crypto from 'node:crypto';

import { type parseTripPath } from './parse-trip-path.js';

/* * */

export function parsePatternTrip(tripRawData: HubV1GtfsTrips, routeRawData: HubV1GtfsRoutes, encodedPolyline: EncodedPolyline, validDates: OperationalDateInt[], tripPath: ReturnType<typeof parseTripPath>, parsedPatternsForThisPatternGroup: Map<string, HubV1ApiPattern>) {
	const { districtIdsList, districtNamesList, facilitiesList, localityIdsList, localityNamesList, municipalityIdsList, municipalityNamesList, parishIdsList, parishNamesList, stopTimesAsCompletePath, stopTimesAsCompleteSchedule, stopTimesAsSimplifiedSchedule } = tripPath;

	// Get the qualified line ID for the current pattern ID

	const qualifiedLineId = getQualifiedLineId(routeRawData.agency_id, routeRawData.route_short_name);

	//
	// Create the pattern version object with only the fields used to differentiate between each version.
	// A pattern version is differentiated by the fields below, with special focus on direction_id,
	// trip_headsign, shape_id and the simplified version of path (stop_id and stop_sequence).
	// This means that everytime any of these fields differs, a new pattern version will be created,
	// and a different set of dates will be associated with it.

	const currentPatternGroup: Partial<HubV1ApiPattern> = {
		_id: tripRawData.pattern_id,
		agency_id: routeRawData.agency_id,
		color: HexColorSchema.parse(routeRawData.route_color || '#000000'),
		direction_id: tripRawData.direction_id,
		headsign: tripRawData.trip_headsign,
		line_id: qualifiedLineId,
		route_id: routeRawData.route_id,
		shape_polyline: encodedPolyline,
		short_name: routeRawData.route_short_name,
		text_color: HexColorSchema.parse(routeRawData.route_text_color || '#FFFFFF'),
	};

	//
	// Create a hash of the object to detect if this pattern version already exists

	const currentPatternVersionHash = crypto.createHash('sha256').update(JSON.stringify(currentPatternGroup)).digest('hex');

	//
	// Check if this pattern version already exists, and create if it doesn't.
	// The created pattern version will have all the complete information that was not used to differentiate between versions.

	let currentPatternObject: HubV1ApiPattern;

	const parsedPatternObject = parsedPatternsForThisPatternGroup.get(currentPatternVersionHash);

	if (parsedPatternObject) {
		currentPatternObject = parsedPatternObject;
	} else {
		currentPatternObject = {
			_id: tripRawData.pattern_id,
			agency_id: routeRawData.agency_id,
			color: HexColorSchema.parse(routeRawData.route_color || '#000000'),
			direction_id: tripRawData.direction_id,
			district_ids: [],
			district_names: [],
			facilities: [],
			headsign: tripRawData.trip_headsign,
			line_id: qualifiedLineId,
			locality_ids: [],
			locality_names: [],
			municipality_ids: [],
			municipality_names: [],
			parish_ids: [],
			parish_names: [],
			path: stopTimesAsCompletePath,
			route_id: routeRawData.route_id,
			shape_extension: 0,
			shape_id: tripRawData.shape_id,
			shape_polyline: encodedPolyline,
			short_name: routeRawData.route_short_name,
			text_color: HexColorSchema.parse(routeRawData.route_text_color || '#FFFFFF'),
			trips: [],
			tts_headsign: '',
			valid_on: [],
			version_id: currentPatternVersionHash,
		};
	}

	//
	// Add to the current pattern group (new or exising) the data retrieved from the current trip

	currentPatternObject.valid_on = Array.from(new Set([...validDates, ...currentPatternObject.valid_on]));
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

	const allTripGroupsForThisPattern = new Map<string, HubV1ApiPatternTrip>();
	currentPatternObject.trips.forEach(item => allTripGroupsForThisPattern.set(item.version_id, item));

	let currentTripGroupObject: HubV1ApiPatternTrip;

	const parsedTripGroupObject = allTripGroupsForThisPattern.get(currentTripGroupHash);

	if (parsedTripGroupObject) {
		currentTripGroupObject = parsedTripGroupObject;
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

	currentTripGroupObject.valid_on = Array.from(new Set([...validDates, ...currentTripGroupObject.valid_on]));
	currentTripGroupObject.service_ids = Array.from(new Set([tripRawData.service_id, ...currentTripGroupObject.service_ids]));
	currentTripGroupObject.trip_ids = Array.from(new Set([tripRawData.trip_id, ...currentTripGroupObject.trip_ids]));

	allTripGroupsForThisPattern.set(currentTripGroupHash, currentTripGroupObject);

	currentPatternObject.trips = Array.from(allTripGroupsForThisPattern.values());

	parsedPatternsForThisPatternGroup.set(currentPatternVersionHash, currentPatternObject);
	return currentPatternObject;
}
