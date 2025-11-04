/* * */

import { type GTFS_Binary, type GTFS_Ternary, validateGtfsBinary, validateGtfsTernary } from '@/gtfs/common.js';

/**
 * Represents a trip in the GTFS (General Transit Feed Specification) format.
 * A trip is a sequence of one or more stops that a vehicle makes during its operation.
 * Each trip is associated with a specific route and service schedule.
 * The trip can have various attributes such as headsign, direction, and accessibility options.
 */
export interface GTFS_Trip {
	bikes_allowed?: GTFS_Ternary
	block_id?: string
	direction_id: GTFS_Binary
	route_id: string
	service_id: string
	shape_id: string
	trip_headsign?: string
	trip_id: string
	trip_short_name?: string
	wheelchair_accessible: GTFS_Ternary
}

/**
 * Represents a raw trip in the GTFS format.
 * This interface is used to parse raw data from GTFS files, where fields may be optional
 * or represented as strings. It is typically used for data ingestion before validation
 * and transformation into the `GTFS_Trip` format.
 */
export interface GTFS_Trip_Raw {
	bikes_allowed?: string
	block_id?: string
	direction_id?: string
	pattern_id?: string
	route_id?: string
	service_id?: string
	shape_id?: string
	trip_headsign?: string
	trip_id?: string
	trip_short_name?: string
	wheelchair_accessible?: string
}

/**
 * Validates and transforms raw GTFS Trip data into a structured GTFS_Trip object.
 * This function checks the types of fields, converts boolean strings to boolean values,
 * and ensures that required fields are present.
 * @param rawData The raw trip data to validate and transform.
 * @returns A validated GTFS_Trip object.
 */
export function validateGtfsTrip(rawData: GTFS_Trip_Raw): GTFS_Trip {
	// Ensure required fields are present
	if (!rawData.route_id) throw new Error('Missing required field "route_id" on GTFS Trip.');
	if (!rawData.service_id) throw new Error('Missing required field "service_id" on GTFS Trip.');
	if (!rawData.trip_id) throw new Error('Missing required field "trip_id" on GTFS Trip.');
	if (!rawData.direction_id) throw new Error('Missing required field "direction_id" on GTFS Trip.');
	if (!rawData.trip_headsign) throw new Error('Missing required field "trip_headsign" on GTFS Trip.');
	if (!rawData.shape_id) throw new Error('Missing required field "shape_id" on GTFS Trip.');
	// Transform the raw data into the output format
	return {
		bikes_allowed: validateGtfsTernary(rawData.bikes_allowed),
		block_id: rawData.block_id,
		direction_id: validateGtfsBinary(rawData.direction_id),
		route_id: rawData.route_id,
		service_id: rawData.service_id,
		shape_id: rawData.shape_id,
		trip_headsign: rawData.trip_headsign,
		trip_id: rawData.trip_id,
		trip_short_name: rawData.trip_short_name,
		wheelchair_accessible: validateGtfsTernary(rawData.wheelchair_accessible),
	};
}

/* * */

/**
 * Extended version of the GTFS_Trip interface that
 * should be used for working with the GTFS-TML standard.
 */
export interface GTFS_Trip_Extended extends GTFS_Trip {
	pattern_id: string
}

/**
 * Represents a raw trip in the GTFS-TML format.
 * This interface is used to parse raw data from GTFS-TML files, where fields may be optional
 * or represented as strings. It is typically used for data ingestion before validation
 * and transformation into the `GTFS_Trip_Extended` format.
 */
export interface GTFS_Trip_Extended_Raw extends GTFS_Trip_Raw {
	pattern_id?: string
}

/**
 * Validates and transforms raw GTFS-TML trip data into a structured GTFS_Trip_Extended object.
 * This function checks the types of fields, converts boolean strings to boolean values,
 * and ensures that required fields are present, including the pattern_id.
 * @param rawData he raw trip data to validate and transform.
 * @returns A validated GTFS_Trip_Extended object.
 */
export function validateGtfsTripExtended(rawData: GTFS_Trip_Extended_Raw): GTFS_Trip_Extended {
	// Validate the standard GTFS fields
	const trip = validateGtfsTrip(rawData);
	// Validate the Extended GTFS fields
	if (!rawData.pattern_id) throw new Error('Missing required field "pattern_id" on GTFS Trip.');
	// Transform the raw data into the output format
	return {
		...trip,
		pattern_id: rawData.pattern_id,
	};
}
