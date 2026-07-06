/* * */

import { type GTFS_Binary, type GTFS_PickupDropoffType, validateGtfsBinary, validateGtfsPickupDropoffType } from '@/gtfs/common.js';

/**
 * Represents the type of vehicle or service provided by a GTFS Route.
 * This type is used to categorize the route based on the mode of transportation it represents.
 * Each route type corresponds to a specific mode of transit, such as bus, subway, ferry, etc.
 * The values are defined according to the GTFS specification.
 */
export type GTFS_RouteType =
  | 0 // Tram, Streetcar, Light rail. Any light rail or street level system within a metropolitan area.
  | 1 // Subway, Metro. Any underground rail system within a metropolitan area.
  | 2 // Rail. Used for intercity or long-distance travel.
  | 3 // Bus. Used for short- and long-distance bus routes.
  | 4 // Ferry. Used for short- and long-distance boat service.
  | 5 // Cable tram. Used for street-level rail cars where the cable runs beneath the vehicle (e.g., cable car in San Francisco).
  | 6 // Aerial lift, suspended cable car (e.g., gondola lift, aerial tramway). Cable transport where cabins, cars, gondolas or open chairs are suspended by means of one or more cables.
  | 7 // Funicular. Any rail system designed for steep inclines.
  | 11 // Trolleybus. Electric buses that draw power from overhead wires using poles.
  | 12; // Monorail. Railway in which the track consists of a single rail or a beam.

/**
 * Validates and transforms a value into a GTFS Route Type.
 * It accepts numeric or string representations of route types.
 * @param value The value to validate and transform.
 * @returns A GTFS Route Type value (0-12).
 * @throws Error if the value is not a valid GTFS Route type representation.
 */
export function validateGtfsRouteType(value: number | string): GTFS_RouteType {
	// Validate the route type value
	if (typeof value === 'number') {
		if (value >= 0 && value <= 12) return value as GTFS_RouteType;
	} else if (typeof value === 'string') {
		const numValue = parseInt(value, 10);
		if (!isNaN(numValue) && numValue >= 0 && numValue <= 12) return numValue as GTFS_RouteType;
	}
	// If the value does not match any known route type, throw an error
	throw new Error(`Invalid GTFS Route Type value: "${value}". It must be a number between 0 and 12.`);
}

/* * */

/**
 * Represents a route in the GTFS (General Transit Feed Specification) format.
 * A route is a group of trips that operate on a specific path or service,
 * typically identified by a unique route ID. Each route can have various attributes
 * such as agency ID, route color, long name, short name, and type of service.
 */
export interface GTFS_Route {
	agency_id: string
	continuous_drop_off?: GTFS_PickupDropoffType
	continuous_pickup?: GTFS_PickupDropoffType
	route_color: string
	route_desc?: string
	route_id: string
	route_long_name: string
	route_short_name: string
	route_sort_order?: number
	route_text_color: string
	route_type: GTFS_RouteType
	route_url?: string
}

/**
 * Represents a raw route in the GTFS format.
 * This interface is used to parse raw data from GTFS files, where fields may be optional
 * or represented as strings. It is typically used for data ingestion before validation
 * and transformation into the `GTFS_Route` format.
 */
export interface GTFS_Route_Raw {
	agency_id?: string
	continuous_drop_off?: string
	continuous_pickup?: string
	route_color?: string
	route_desc?: string
	route_id?: string
	route_long_name?: string
	route_short_name?: string
	route_sort_order?: string
	route_text_color?: string
	route_type?: string
	route_url?: string
}

/**
 * Validates and transforms raw GTFS trip data into a structured GTFS_Route object.
 * This function checks the types of fields, converts boolean strings to boolean values,
 * and ensures that required fields are present.
 * @param rawData The raw trip data to validate and transform.
 * @returns A validated GTFS_Route object.
 */
export function validateGtfsRoute(rawData: GTFS_Route_Raw): GTFS_Route {
	// Ensure required fields are present
	if (!rawData.agency_id) throw new Error('Missing required field "agency_id" on GTFS Route.');
	if (!rawData.route_color) throw new Error('Missing required field "route_color" on GTFS Route.');
	if (!rawData.route_id) throw new Error('Missing required field "route_id" on GTFS Route.');
	if (!rawData.route_long_name) throw new Error('Missing required field "route_long_name" on GTFS Route.');
	if (!rawData.route_short_name) throw new Error('Missing required field "route_short_name" on GTFS Route.');
	if (!rawData.route_text_color) throw new Error('Missing required field "route_text_color" on GTFS Route.');
	if (!rawData.route_type) throw new Error('Missing required field "route_type" on GTFS Route.');
	// Transform the raw data into the output format
	return {
		agency_id: rawData.agency_id,
		continuous_drop_off: validateGtfsPickupDropoffType(rawData.continuous_drop_off),
		continuous_pickup: validateGtfsPickupDropoffType(rawData.continuous_pickup),
		route_color: rawData.route_color,
		route_desc: rawData.route_desc,
		route_id: rawData.route_id,
		route_long_name: rawData.route_long_name,
		route_short_name: rawData.route_short_name,
		route_sort_order: Number(rawData.route_sort_order),
		route_text_color: rawData.route_text_color,
		route_type: validateGtfsRouteType(rawData.route_type),
		route_url: rawData.route_url,
	};
}

/* * */

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
