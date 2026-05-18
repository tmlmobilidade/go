/* * */

import { type GTFS_Binary, GTFS_HasField, type GTFS_Ternary, validateGtfsBinary, validateGtfsTernary } from '@/gtfs/common.js';

/**
 * Represents a GTFS (General Transit Feed Specification) Location Type.
 * This type is used to categorize the location based on its function in the transit system.
 * Each location type corresponds to a specific role, such as a stop, station, or boarding area.
 * The values are defined according to the GTFS specification.
 */
export type GTFS_LocationType =
  | 0 // Stop. A physical location where passengers can board or alight from a transit vehicle.
  | 1 // Station. A physical structure or area where passengers can board or alight from a transit vehicle, typically larger than a stop and may include multiple stops.
  | 2 // Station entrance. A physical entrance to a station, which may be located at a different location than the station itself.
  | 3 // Generic node. A generic location that does not fit into the other categories, such as a point of interest or a landmark.
  | 4; // Boarding area. A specific area within a stop or station where passengers can board a transit vehicle, such as a bus bay or train platform.

/**
 *  Validates and transforms a value into a GTFS Location Type.
 * It accepts numeric or string representations of location types.
 * @param value The value to validate and transform.
 * @returns A GTFS Location Type value (0-4).
 * @throws Error if the value is not a valid GTFS Location type representation.
 */
export function validateGtfsLocationType(value?: number | string): GTFS_LocationType {
	// Return 0 if the value is not provided or is null/undefined
	if (value === undefined || value === null || value === '') {
		return 0;
	}
	// Validate the route type value
	if (typeof value === 'number') {
		if (value >= 0 && value <= 4) return value as GTFS_LocationType;
	} else if (typeof value === 'string') {
		const numValue = parseInt(value, 10);
		if (!isNaN(numValue) && numValue >= 0 && numValue <= 4) return numValue as GTFS_LocationType;
	}
	// If the value does not match any known route type, throw an error
	throw new Error(`Invalid GTFS Location Type value: "${value}". It must be a number between 0 and 4.`);
}

/* * */

/**
 * Represents a stop in the GTFS (General Transit Feed Specification) format.
 * A stop is a group of trips that operate on a specific path or service,
 * typically identified by a unique stop ID. Each stop can have various attributes
 * such as agency ID, stop color, long name, short name, and type of service.
 */
export interface GTFS_Stop {
	level_id?: string
	location_type: GTFS_LocationType
	parent_station?: string
	platform_code?: string
	stop_code: string
	stop_desc?: string
	stop_id: string
	stop_lat: number
	stop_lon: number
	stop_name: string
	stop_timezone?: string
	stop_url?: string
	wheelchair_boarding?: GTFS_Ternary
	zone_id?: string
}

/**
 * Represents a raw stop in the GTFS format.
 * This interface is used to parse raw data from GTFS files, where fields may be optional
 * or represented as strings. It is typically used for data ingestion before validation
 * and transformation into the `GTFS_Stop` format.
 */
export interface GTFS_Stop_Raw {
	level_id?: string
	location_type?: string
	parent_station?: string
	platform_code?: string
	stop_code?: string
	stop_desc?: string
	stop_id?: string
	stop_lat?: string
	stop_lon?: string
	stop_name?: string
	stop_timezone?: string
	stop_url?: string
	wheelchair_boarding?: string
	zone_id?: string
}

/**
 * Validates and transforms a raw GTFS stop into the GTFS_Stop format.
 * This function checks the types of fields, converts boolean strings to boolean values,
 * and ensures that required fields are present.
 * @param rawData The raw trip data to validate and transform.
 * @returns A validated GTFS_Stop object.
 */
export function validateGtfsStop(rawData: GTFS_Stop_Raw): GTFS_Stop {
	// Ensure required fields are present
	if (!rawData.stop_code) throw new Error('Missing required field "stop_code" on GTFS Stop.');
	if (!rawData.stop_id) throw new Error('Missing required field "stop_id" on GTFS Stop.');
	if (!rawData.stop_lat) throw new Error('Missing required field "stop_lat" on GTFS Stop.');
	if (!rawData.stop_lon) throw new Error('Missing required field "stop_lon" on GTFS Stop.');
	if (!rawData.stop_name) throw new Error('Missing required field "stop_name" on GTFS Stop.');
	// Transform the raw data into the output format
	return {
		level_id: rawData.level_id,
		location_type: validateGtfsLocationType(rawData.location_type),
		parent_station: rawData.parent_station,
		platform_code: rawData.platform_code,
		stop_code: rawData.stop_code,
		stop_desc: rawData.stop_desc,
		stop_id: rawData.stop_id,
		stop_lat: Number(rawData.stop_lat),
		stop_lon: Number(rawData.stop_lon),
		stop_name: rawData.stop_name,
		stop_timezone: rawData.stop_timezone,
		stop_url: rawData.stop_url,
		wheelchair_boarding: validateGtfsTernary(rawData.wheelchair_boarding),
		zone_id: rawData.zone_id,
	};
}

/* * */

/**
 * Extended version of the GTFS_Stop interface that
 * should be used for working with the GTFS-TML standard.
 */
export interface GTFS_Stop_Extended extends GTFS_Stop {
	has_bench?: GTFS_HasField
	has_network_map?: GTFS_HasField
	has_pip_real_time?: GTFS_HasField
	has_schedules?: GTFS_HasField
	has_shelter?: GTFS_HasField
	has_stop_sign?: GTFS_HasField
	has_tariffs_information?: GTFS_HasField
	municipality_id?: string
	parish_id?: string
	public_visible?: GTFS_Binary
	region_id?: string
	shelter_code?: string
	shelter_maintainer?: string
	stop_short_name?: string
	tts_stop_name?: string
}

/**
 * Represents a raw stop in the GTFS-TML format.
 * This interface is used to parse raw data from GTFS-TML files, where fields may be optional
 * or represented as strings. It is typically used for data ingestion before validation
 * and transformation into the `GTFS_Stop_Extended` format.
 */
export interface GTFS_Stop_Extended_Raw extends GTFS_Stop_Raw {
	has_bench?: string
	has_network_map?: string
	has_pip_real_time?: string
	has_schedules?: string
	has_shelter?: string
	has_stop_sign?: string
	has_tariffs_information?: string
	municipality_id?: string
	parish_id?: string
	public_visible?: string
	region_id?: string
	shelter_code?: string
	shelter_maintainer?: string
	stop_short_name?: string
	tts_stop_name?: string
}

/**
 * Validates and transforms raw GTFS-TML stop data into a structured GTFS_Stop_Extended object.
 * This function checks the types of fields, converts boolean strings to boolean values,
 * and ensures that required fields are present, including the pattern_id.
 * @param rawData he raw stop data to validate and transform.
 * @returns A validated GTFS_Stop_Extended object.
 */
export function validateGtfsStopExtended(rawData: GTFS_Stop_Extended_Raw): GTFS_Stop_Extended {
	// Validate the standard GTFS fields
	const stop = validateGtfsStop(rawData);
	// Validate the Extended GTFS fields
	// if (!rawData.municipality_id) throw new Error('Missing required field "municipality_id" on GTFS Stop.');
	// Transform the raw data into the output format
	return {
		...stop,
		has_bench: validateGtfsBinary(rawData.has_bench),
		has_network_map: validateGtfsBinary(rawData.has_network_map),
		has_pip_real_time: validateGtfsBinary(rawData.has_pip_real_time),
		has_schedules: validateGtfsBinary(rawData.has_schedules),
		has_shelter: validateGtfsBinary(rawData.has_shelter),
		has_stop_sign: validateGtfsBinary(rawData.has_stop_sign),
		has_tariffs_information: validateGtfsBinary(rawData.has_tariffs_information),
		municipality_id: rawData.municipality_id,
		parish_id: rawData.parish_id,
		public_visible: validateGtfsBinary(rawData.public_visible),
		region_id: rawData.region_id,
		shelter_code: rawData.shelter_code,
		shelter_maintainer: rawData.shelter_maintainer,
		stop_short_name: rawData.stop_short_name,
		tts_stop_name: rawData.tts_stop_name,
	};
}
