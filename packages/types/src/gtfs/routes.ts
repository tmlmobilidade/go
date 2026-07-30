/* * */

import { type GTFS_Binary, validateGtfsBinary } from '@/gtfs/common.js';

/**
 * Represents the type of path for a GTFS route.
 * This type is used to indicate whether the path is a base path, a partial path,
 * or a variant path. It is used in the GTFS-TML (Transporte Metropolitano de Lisboa) standard
 * to differentiate between different types of paths for a route.
 */
export type GTFS_PathType =
  | 1 // Base path
  | 2 // Partial path
  | 3; // Variant path

/**
 * Validates and transforms a value into a GTFS Path Type.
 * It accepts numeric or string representations of path types.
 * @param value The value to validate and transform.
 * @returns A GTFS Path Type value (1, 2, or 3).
 * @throws Error if the value is not a valid GTFS Path Type representation.
 */
export function validateGTFSPathType(value?: number | string): GTFS_PathType {
	// If the value is not provided, default to 1 (Base path)
	if (value === undefined || value === null) return 1;
	// Handle numeric and string representations of GTFS Path Type values
	if (typeof value === 'number') {
		if (value === 1) return 1;
		if (value === 2) return 2;
		if (value === 3) return 3;
	}
	if (typeof value === 'string') {
		if (value === '1') return 1;
		if (value === '2') return 2;
		if (value === '3') return 3;
	}
	// If the value does not match any known GTFS Path Type representation, throw an error
	throw new Error(`Invalid GTFS Path Type value: "${value}". It must be 1, 2 or 3.`);
}

/* * */

/**
 * Extended version of the GTFS_Route interface that
 * should be used for working with the GTFS-TML standard.
 */
export interface GTFS_Route_Extended extends GTFS_Route {
	circular?: GTFS_Binary
	line_id: string
	line_long_name: string
	line_short_name: string
	path_type?: GTFS_PathType
	route_remarks?: string
	school?: GTFS_Binary
}

/**
 * Represents a raw trip in the GTFS-TML format.
 * This interface is used to parse raw data from GTFS-TML files, where fields may be optional
 * or represented as strings. It is typically used for data ingestion before validation
 * and transformation into the `GTFS_Route_Extended` format.
 */
export interface GTFS_Route_Extended_Raw extends GTFS_Route_Raw {
	circular?: string
	line_id?: string
	line_long_name?: string
	line_short_name?: string
	path_type?: string
	route_remarks?: string
	school?: string
}

/**
 * Validates and transforms raw GTFS-TML route data into a structured GTFS_Route_Extended object.
 * This function checks the types of fields, converts boolean strings to boolean values,
 * and ensures that required fields are present, including the pattern_id.
 * @param rawData he raw route data to validate and transform.
 * @returns A validated GTFS_Route_Extended object.
 */
export function validateGtfsRouteExtended(rawData: GTFS_Route_Extended_Raw): GTFS_Route_Extended {
	// Validate the standard GTFS fields
	const route = validateGtfsRoute(rawData);
	// Validate the Extended GTFS fields
	if (!rawData.line_id) throw new Error('Missing required field "line_id" on GTFS Route.');
	if (!rawData.line_long_name) throw new Error('Missing required field "line_long_name" on GTFS Route.');
	if (!rawData.line_short_name) throw new Error('Missing required field "line_short_name" on GTFS Route.');
	// Transform the raw data into the output format
	return {
		...route,
		circular: validateGtfsBinary(rawData.circular),
		line_id: rawData.line_id,
		line_long_name: rawData.line_long_name,
		line_short_name: rawData.line_short_name,
		path_type: validateGTFSPathType(rawData.path_type),
		route_remarks: rawData.route_remarks,
		school: validateGtfsBinary(rawData.school),
	};
}
