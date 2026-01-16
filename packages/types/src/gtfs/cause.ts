/* * */

import z from 'zod';

/* * */

export const GtfsCauseValues = [
	'ACCIDENT',
	'CONSTRUCTION',
	'DEMONSTRATION',
	'HOLIDAY',
	'MAINTENANCE',
	'MEDICAL_EMERGENCY',
	'POLICE_ACTIVITY',
	'STRIKE',
	'TECHNICAL_PROBLEM',
	'WEATHER',
	// 'OTHER_CAUSE',
	// 'UNKNOWN_CAUSE',
] as const;

export const GtfsCauseSchema = z.enum(GtfsCauseValues);

export type GtfsCause = z.infer<typeof GtfsCauseSchema>;

/* * */

export const GtfsCauseExtendedValues = [
	...GtfsCauseValues,
	'DRIVER_ABSENCE',
	'DRIVER_ISSUE',
	'HIGH_PASSENGER_LOAD',
	'ROAD_INCIDENT',
	'SYSTEM_FAILURE',
	'TRAFFIC_JAM',
	'VEHICLE_ISSUE',
] as const;

export const GtfsCauseExtendedSchema = z.enum(GtfsCauseExtendedValues);

export type GtfsCauseExtended = z.infer<typeof GtfsCauseExtendedSchema>;

/* * */

export const GtfsExtendedCauseMap = Object.freeze({

	/* --- Standard GtfsExtended Causes --- */
	ACCIDENT: 'ACCIDENT',
	CONSTRUCTION: 'CONSTRUCTION',
	DEMONSTRATION: 'DEMONSTRATION',
	HOLIDAY: 'HOLIDAY',
	MAINTENANCE: 'MAINTENANCE',
	MEDICAL_EMERGENCY: 'MEDICAL_EMERGENCY',
	POLICE_ACTIVITY: 'POLICE_ACTIVITY',
	STRIKE: 'STRIKE',
	TECHNICAL_PROBLEM: 'TECHNICAL_PROBLEM',
	WEATHER: 'WEATHER',
	// OTHER_CAUSE: 'OTHER_CAUSE',
	// UNKNOWN_CAUSE: 'UNKNOWN_CAUSE',

	/* --- Extended Operational Causes --- */
	DRIVER_ABSENCE: 'DRIVER_ABSENCE',
	DRIVER_ISSUE: 'DRIVER_ISSUE',
	HIGH_PASSENGER_LOAD: 'HIGH_PASSENGER_LOAD',
	ROAD_INCIDENT: 'ROAD_INCIDENT',
	SYSTEM_FAILURE: 'SYSTEM_FAILURE',
	TRAFFIC_JAM: 'TRAFFIC_JAM',
	VEHICLE_ISSUE: 'VEHICLE_ISSUE',

});
