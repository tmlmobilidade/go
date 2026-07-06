/* * */

import { type OperationalDate, validateOperationalDate } from '@tmlmobilidade/go-types-shared';

/**
 * Represents the type of exception for a service
 * in the GTFS (General Transit Feed Specification) format.
 * The exception type indicates whether a service
 * has been added or removed for a specific date.
 */
export type GTFS_ExceptionType = 1 | 2;

/**
 * Validates and transforms a value into a GTFS Exception Type.
 * It accepts numeric or string representations of exception types.
 * @param value The value to validate and transform.
 * @returns A GTFS Exception Type value (1 or 2).
 * @throws Error if the value is not a valid GTFS Exception Type representation.
 */
export function validateGtfsExceptionType(value: number | string): GTFS_ExceptionType {
	// Validate the exception type value
	if (value === 1 || value === '1') return 1;
	if (value === 2 || value === '2') return 2;
	// If the value does not match any known exception type, throw an error
	throw new Error(`Invalid GTFS Exception Type value: "${value}". It must be 1 (Service Added) or 2 (Service Removed).`);
}

/* * */

/**
 * Represents a calendar date exception in the GTFS format.
 * A calendar date exception indicates a specific date
 * when a service is either added or removed from the schedule.
 */
export interface GTFS_CalendarDate {
	date: OperationalDate
	exception_type: GTFS_ExceptionType
	service_id: string
}

/**
 * Represents a raw calendar date exception in the GTFS format.
 * This interface is used to parse raw data from GTFS files,
 * where fields may be optional or represented as strings.
 * It is typically used for data ingestion before validation
 * and transformation into the `GTFS_CalendarDate` format.
 */
export interface GTFS_CalendarDate_Raw {
	date?: string
	exception_type?: string
	service_id?: string
}

/**
 * Validates and transforms a raw GTFS Calendar Date exception
 * into the GTFS_CalendarDate format.
 * This function checks the types of fields, converts string representations
 * to appropriate types, and ensures that required fields are present.
 * @param rawData The raw calendar date exception data to validate and transform.
 * @returns A validated GTFS_CalendarDate object.
 */
export function validateGtfsCalendarDate(rawData: GTFS_CalendarDate_Raw): GTFS_CalendarDate {
	// Ensure required fields are present
	if (!rawData.service_id) throw new Error('Missing required field "service_id" on GTFS calendar date.');
	if (!rawData.date) throw new Error('Missing required field "date" on GTFS calendar date.');
	if (!rawData.exception_type) throw new Error('Missing required field "exception_type" on GTFS calendar date.');
	// Transform the raw data into the output format
	return {
		date: validateOperationalDate(rawData.date),
		exception_type: validateGtfsExceptionType(rawData.exception_type),
		service_id: rawData.service_id,
	};
}
