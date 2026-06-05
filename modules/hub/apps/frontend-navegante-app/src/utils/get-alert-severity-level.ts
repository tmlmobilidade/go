/* * */

import { type AlertCause, type AlertEffect } from '@tmlmobilidade/types';

/* * */

export type AlertSeverityLevel = 'high' | 'info' | 'low' | 'medium';
const CAUSE_SEVERITY: Record<AlertCause, AlertSeverityLevel> = {
	ABUSIVE_PARKING: 'medium',
	ACCIDENT: 'high',
	CONSTRUCTION: 'high',
	DEMONSTRATION: 'high',
	DRIVER_ABSENCE: 'high',
	DRIVER_ISSUE: 'high',
	HIGH_PASSENGER_LOAD: 'high',
	MEDICAL_EMERGENCY: 'high',
	NETWORK_UPDATE: 'info',
	POLICE_ACTIVITY: 'high',
	PUBLIC_DISORDER: 'high',
	ROAD_ISSUE: 'high',
	STRIKE: 'high',
	TECHNICAL_ISSUE: 'high',
	TRAFFIC_JAM: 'high',
	VEHICLE_ISSUE: 'high',
	WEATHER: 'high',
};

const EFFECT_SEVERITY: Record<AlertEffect, AlertSeverityLevel> = {
	ACCESSIBILITY_ISSUE: 'low',
	ADDITIONAL_SERVICE: 'info',
	DETOUR: 'medium',
	MODIFIED_SERVICE: 'low',
	NO_SERVICE: 'high',
	ON_BOARD_SALE_ISSUE: 'low',
	REALTIME_INFO_ISSUE: 'low',
	REDUCED_SERVICE: 'low',
	SIGNIFICANT_DELAYS: 'high',
	STOP_MOVED: 'low',
};

/* * */

export function getCauseSeverityLevel(cause: AlertCause): AlertSeverityLevel {
	return CAUSE_SEVERITY[cause];
}

export function getEffectSeverityLevel(effect: AlertEffect): AlertSeverityLevel {
	return EFFECT_SEVERITY[effect];
}
