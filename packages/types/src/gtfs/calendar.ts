/* * */

import { type GTFS_Binary, validateGtfsBinary } from '@/gtfs/common.js';
import { OperationalDate, validateOperationalDate } from '@tmlmobilidade/go-types-shared';

/**
 * Represents a calendar in the GTFS (General Transit Feed Specification) format.
 * A calendar defines the days of the week on which a particular service is available,
 * along with the start and end dates of the service period.
 */
export interface GTFS_Calendar {
	end_date: OperationalDate
	friday: GTFS_Binary
	monday: GTFS_Binary
	saturday: GTFS_Binary
	service_id: string
	start_date: OperationalDate
	sunday: GTFS_Binary
	thursday: GTFS_Binary
	tuesday: GTFS_Binary
	wednesday: GTFS_Binary
}

/**
 * Represents a raw calendar in the GTFS format.
 * This interface is used to parse raw data from GTFS files, where fields may be optional
 * or represented as strings. It is typically used for data ingestion before validation
 * and transformation into the `GTFS_Calendar` format.
 */
export interface GTFS_Calendar_Raw {
	end_date?: string
	friday?: string
	monday?: string
	saturday?: string
	service_id?: string
	start_date?: string
	sunday?: string
	thursday?: string
	tuesday?: string
	wednesday?: string
}

/**
 * Validates and transforms a raw GTFS calendar into the GTFS_Calendar format.
 * This function checks the types of fields, converts boolean strings to boolean values,
 * and ensures that required fields are present.
 * @param rawData The raw calendar data to validate and transform.
 * @returns A validated GTFS_Calendar object.
 */
export function validateGtfsCalendar(rawData: GTFS_Calendar_Raw): GTFS_Calendar {
	// Ensure required fields are present
	if (!rawData.service_id) throw new Error('Missing required field "service_id" on GTFS calendar.');
	if (!rawData.start_date) throw new Error('Missing required field "start_date" on GTFS calendar.');
	if (!rawData.end_date) throw new Error('Missing required field "end_date" on GTFS calendar.');
	if (!rawData.monday) throw new Error('Missing required field "monday" on GTFS calendar.');
	if (!rawData.tuesday) throw new Error('Missing required field "tuesday" on GTFS calendar.');
	if (!rawData.wednesday) throw new Error('Missing required field "wednesday" on GTFS calendar.');
	if (!rawData.thursday) throw new Error('Missing required field "thursday" on GTFS calendar.');
	if (!rawData.friday) throw new Error('Missing required field "friday" on GTFS calendar.');
	if (!rawData.saturday) throw new Error('Missing required field "saturday" on GTFS calendar.');
	if (!rawData.sunday) throw new Error('Missing required field "sunday" on GTFS calendar.');
	// Transform the raw data into the output format
	return {
		end_date: validateOperationalDate(rawData.end_date),
		friday: validateGtfsBinary(rawData.friday),
		monday: validateGtfsBinary(rawData.monday),
		saturday: validateGtfsBinary(rawData.saturday),
		service_id: rawData.service_id,
		start_date: validateOperationalDate(rawData.start_date),
		sunday: validateGtfsBinary(rawData.sunday),
		thursday: validateGtfsBinary(rawData.thursday),
		tuesday: validateGtfsBinary(rawData.tuesday),
		wednesday: validateGtfsBinary(rawData.wednesday),
	};
}
