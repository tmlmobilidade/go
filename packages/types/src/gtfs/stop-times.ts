/* * */

import { type GTFS_Binary, type GTFS_PickupDropoffType, validateGtfsBinary, validateGtfsPickupDropoffType } from '@/gtfs/common.js';

/**
 * Represents a stop time in the GTFS (General Transit Feed Specification) format.
 * A stop time is a record of when a transit vehicle arrives at and departs from a specific stop.
 * It includes information such as the arrival and departure times, the stop ID, the trip ID,
 * and various pickup and drop-off types. This information is crucial for scheduling and
 * coordinating transit services, allowing passengers to know when a vehicle will be at a particular stop
 * and what type of service is available at that stop.
 */
export interface GTFS_StopTime {
	arrival_time: string
	continuous_drop_off?: GTFS_PickupDropoffType
	continuous_pickup?: GTFS_PickupDropoffType
	departure_time: string
	drop_off_type?: GTFS_PickupDropoffType
	pickup_type?: GTFS_PickupDropoffType
	shape_dist_traveled: number
	stop_headsign?: string
	stop_id: string
	stop_sequence: number
	timepoint: GTFS_Binary
	trip_id: string
}

/**
 * Represents a raw stop time in the GTFS format.
 * This interface is used to parse raw data from GTFS files, where fields may be optional
 * or represented as strings. It is typically used for data ingestion before validation
 * and transformation into the `GTFS_Stop` format.
 */
export interface GTFS_StopTime_Raw {
	arrival_time?: string
	continuous_drop_off?: string
	continuous_pickup?: string
	departure_time?: string
	drop_off_type?: string
	pickup_type?: string
	shape_dist_traveled?: string
	stop_headsign?: string
	stop_id?: string
	stop_sequence?: string
	timepoint?: string
	trip_id?: string
}

/**
 * Validates and transforms a raw GTFS stop time into the GTFS_StopTime format.
 * This function checks the types of fields, converts boolean strings to boolean values,
 * and ensures that required fields are present.
 * @param rawData The raw trip data to validate and transform.
 * @returns A validated GTFS_StopTime object.
 */
export function validateGtfsStopTime(rawData: GTFS_StopTime_Raw): GTFS_StopTime {
	// Ensure required fields are present
	if (!rawData.arrival_time) throw new Error(`Missing required field "arrival_time" on GTFS StopTime: ${JSON.stringify(rawData)}`);
	if (!rawData.departure_time) throw new Error(`Missing required field "departure_time" on GTFS StopTime: ${JSON.stringify(rawData)}`);
	if (!rawData.shape_dist_traveled) throw new Error(`Missing required field "shape_dist_traveled" on GTFS StopTime: ${JSON.stringify(rawData)}`);
	if (!rawData.stop_id) throw new Error(`Missing required field "stop_id" on GTFS StopTime: ${JSON.stringify(rawData)}`);
	if (!rawData.stop_sequence) throw new Error(`Missing required field "stop_sequence" on GTFS StopTime: ${JSON.stringify(rawData)}`);
	if (!rawData.trip_id) throw new Error(`Missing required field "trip_id" on GTFS StopTime: ${JSON.stringify(rawData)}`);
	// Validate the individual fields
	if (Number.isNaN(rawData.shape_dist_traveled)) throw new Error(`Invalid value for "shape_dist_traveled": "${rawData.shape_dist_traveled}". It must be a number. GTFS StopTime: ${JSON.stringify(rawData)}`);
	if (Number.isNaN(rawData.stop_sequence)) throw new Error(`Invalid value for "stop_sequence": "${rawData.stop_sequence}". It must be a number. GTFS StopTime: ${JSON.stringify(rawData)}`);
	// Transform the raw data into the output format
	return {
		arrival_time: rawData.arrival_time,
		continuous_drop_off: validateGtfsPickupDropoffType(rawData.continuous_drop_off),
		continuous_pickup: validateGtfsPickupDropoffType(rawData.continuous_pickup),
		departure_time: rawData.departure_time,
		drop_off_type: validateGtfsPickupDropoffType(rawData.drop_off_type),
		pickup_type: validateGtfsPickupDropoffType(rawData.pickup_type),
		shape_dist_traveled: Number(rawData.shape_dist_traveled),
		stop_headsign: rawData.stop_headsign,
		stop_id: rawData.stop_id,
		stop_sequence: Number(rawData.stop_sequence),
		timepoint: validateGtfsBinary(rawData.timepoint),
		trip_id: rawData.trip_id,
	};
}
