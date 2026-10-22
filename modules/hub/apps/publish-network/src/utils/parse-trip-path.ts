/* * */

import { type GtfsStopTimes } from '@tmlmobilidade/go-types-gtfs';
import { type HubV1ApiPatternWaypoint, type HubV1ApiScheduledArrival, type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';

/* * */

export function parseTripPath(stopTimesRaw: GtfsStopTimes[], allStopsParsedMap: Map<string, HubV1ApiStop>) {
	const stopTimesAsSimplifiedPath: { id: string, stop_sequence: number }[] = [];
	const stopTimesAsCompletePath: HubV1ApiPatternWaypoint[] = [];

	const stopTimesAsSimplifiedSchedule: { arrival_time: string, stop_id: string, stop_sequence: number }[] = [];
	const stopTimesAsCompleteSchedule: HubV1ApiScheduledArrival[] = [];

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

		const stopParsedData = allStopsParsedMap.get(stopTimeRawData.stop_id);

		if (!stopParsedData) {
			throw new Error(`Stop not found: ${stopTimeRawData.stop_id}`);
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
			allow_drop_off: stopTimeRawData.drop_off_type !== '1', // Alight.NOT_AVAILABLE
			allow_pickup: stopTimeRawData.pickup_type !== '1', // Alight.NOT_AVAILABLE
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

	return {
		districtIdsList,
		districtNamesList,
		facilitiesList,
		localityIdsList,
		localityNamesList,
		municipalityIdsList,
		municipalityNamesList,
		parishIdsList,
		parishNamesList,
		stopTimesAsCompletePath,
		stopTimesAsCompleteSchedule,
		stopTimesAsSimplifiedPath,
		stopTimesAsSimplifiedSchedule,
	};
}

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
