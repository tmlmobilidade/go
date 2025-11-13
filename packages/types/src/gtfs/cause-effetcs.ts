import z from 'zod';

export const GTFS_CAUSE_VALUES = ['ACCIDENT', 'CONSTRUCTION', 'DEMONSTRATION', 'HOLIDAY', 'MAINTENANCE', 'MEDICAL_EMERGENCY', 'OTHER_CAUSE', 'POLICE_ACTIVITY', 'STRIKE', 'TECHNICAL_PROBLEM', 'UNKNOWN_CAUSE', 'WEATHER'] as const;
export const GTFS_EFFECT_VALUES = ['ACCESSIBILITY_ISSUE', 'ADDITIONAL_SERVICE', 'DETOUR', 'MODIFIED_SERVICE', 'NO_EFFECT', 'NO_SERVICE', 'OTHER_EFFECT', 'REDUCED_SERVICE', 'SIGNIFICANT_DELAYS', 'STOP_MOVED', 'UNKNOWN_EFFECT'] as const;

/* * */

export const GTFS_CAUSE_EXTENDED_VALUES = [...GTFS_CAUSE_VALUES, 'DRIVER_ABSENCE', 'DRIVER_ISSUE', 'HIGH_PASSENGER_LOAD', 'ROAD_INCIDENT', 'SYSTEM_FAILURE', 'TRAFFIC_JAM', 'VEHICLE_ISSUE'] as const;

export const GtfsExtendedCauseMap = Object.freeze({
	/* --- Standard GtfsExtended Causes --- */
	ACCIDENT: { code: 'ACCIDENT', gtfs_code: 'ACCIDENT' },
	CONSTRUCTION: { code: 'CONSTRUCTION', gtfs_code: 'CONSTRUCTION' },
	DEMONSTRATION: { code: 'DEMONSTRATION', gtfs_code: 'DEMONSTRATION' },
	HOLIDAY: { code: 'HOLIDAY', gtfs_code: 'HOLIDAY' },
	MAINTENANCE: { code: 'MAINTENANCE', gtfs_code: 'MAINTENANCE' },
	MEDICAL_EMERGENCY: { code: 'MEDICAL_EMERGENCY', gtfs_code: 'MEDICAL_EMERGENCY' },
	OTHER_CAUSE: { code: 'OTHER_CAUSE', gtfs_code: 'OTHER_CAUSE' },
	POLICE_ACTIVITY: { code: 'POLICE_ACTIVITY', gtfs_code: 'POLICE_ACTIVITY' },
	STRIKE: { code: 'STRIKE', gtfs_code: 'STRIKE' },
	TECHNICAL_PROBLEM: { code: 'TECHNICAL_PROBLEM', gtfs_code: 'TECHNICAL_PROBLEM' },
	UNKNOWN_CAUSE: { code: 'UNKNOWN_CAUSE', gtfs_code: 'UNKNOWN_CAUSE' },
	WEATHER: { code: 'WEATHER', gtfs_code: 'WEATHER' },

	/* --- Extended Operational Causes --- */
	DRIVER_ABSENCE: { code: 'DRIVER_ABSENCE', gtfs_code: 'OTHER_CAUSE' },
	DRIVER_ISSUE: { code: 'DRIVER_ISSUE', gtfs_code: 'OTHER_CAUSE' },
	HIGH_PASSENGER_LOAD: { code: 'HIGH_PASSENGER_LOAD', gtfs_code: 'OTHER_CAUSE' },
	ROAD_INCIDENT: { code: 'ROAD_INCIDENT', gtfs_code: 'ACCIDENT' },
	SYSTEM_FAILURE: { code: 'SYSTEM_FAILURE', gtfs_code: 'TECHNICAL_PROBLEM' },
	TRAFFIC_JAM: { code: 'TRAFFIC_JAM', gtfs_code: 'OTHER_CAUSE' },
	VEHICLE_ISSUE: { code: 'VEHICLE_ISSUE', gtfs_code: 'OTHER_CAUSE' },
});

/* * */

export const gtfsCauseSchema = z.enum(GTFS_CAUSE_EXTENDED_VALUES);
export const gtfsEffectSchema = z.enum(GTFS_EFFECT_VALUES);

export type GtfsCause = z.infer<typeof gtfsCauseSchema>;
export type GtfsEffect = z.infer<typeof gtfsEffectSchema>;
