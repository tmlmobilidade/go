/* * */

import { type GtfsCause } from '@/gtfs/cause.js';
import z from 'zod';

/* * */

export const AlertCauseValues = [

	//
	// Standard

	'ACCIDENT',
	'CONSTRUCTION',
	'DEMONSTRATION',
	'MEDICAL_EMERGENCY',
	'POLICE_ACTIVITY',
	'STRIKE',
	'TECHNICAL_ISSUE',
	'WEATHER',

	//
	// Extended

	'ABUSIVE_PARKING',
	'DRIVER_ABSENCE',
	'DRIVER_ISSUE',
	'HIGH_PASSENGER_LOAD',
	'ROAD_ISSUE',
	'TRAFFIC_JAM',
	'PUBLIC_DISORDER',

] as const;

export const AlertCauseSchema = z.enum(AlertCauseValues);

/**
 * The Alert extended cause types.
 * This types represents the allowed values for the cause of a service alert
 * in the application, which are a subset of the standard GTFS-RT causes and
 * additional operational causes specific to the application's context.
 */
export type AlertCause = z.infer<typeof AlertCauseSchema>;

/**
 * Mapping from AlertCause to GtfsCause.
 * This mapping is used to convert extended alert causes
 * to their corresponding standard GTFS-RT cause types.
 */
export const AlertCauseToGtfsCauseMap: Record<AlertCause, GtfsCause> = {
	ABUSIVE_PARKING: 'OTHER_CAUSE',
	ACCIDENT: 'ACCIDENT',
	CONSTRUCTION: 'CONSTRUCTION',
	DEMONSTRATION: 'DEMONSTRATION',
	DRIVER_ABSENCE: 'OTHER_CAUSE',
	DRIVER_ISSUE: 'OTHER_CAUSE',
	HIGH_PASSENGER_LOAD: 'OTHER_CAUSE',
	MEDICAL_EMERGENCY: 'MEDICAL_EMERGENCY',
	POLICE_ACTIVITY: 'POLICE_ACTIVITY',
	PUBLIC_DISORDER: 'OTHER_CAUSE',
	ROAD_ISSUE: 'OTHER_CAUSE',
	STRIKE: 'STRIKE',
	TECHNICAL_ISSUE: 'TECHNICAL_ISSUE',
	TRAFFIC_JAM: 'OTHER_CAUSE',
	WEATHER: 'WEATHER',
};
