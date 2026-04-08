/* * */

import { type AlertCause, type AlertEffect } from '@tmlmobilidade/types';

/* * */

export function getCauseSeverityLevel(cause: AlertCause): number {
	switch (cause) {
		case 'ACCIDENT':
		case 'CONSTRUCTION':
		case 'DEMONSTRATION':
		case 'DRIVER_ABSENCE':
		case 'DRIVER_ISSUE':
		case 'HIGH_PASSENGER_LOAD':
		case 'MEDICAL_EMERGENCY':
		case 'POLICE_ACTIVITY':
		case 'PUBLIC_DISORDER':
		case 'ROAD_ISSUE':
		case 'STRIKE':
		case 'TECHNICAL_ISSUE':
		case 'TRAFFIC_JAM':
		case 'VEHICLE_ISSUE':
		case 'WEATHER':
			return 3;
		case 'NETWORK_UPDATE':
			return 0;
		case 'ABUSIVE_PARKING':
		default:
			return 2;
	}
}

export function getEffectSeverityLevel(effect: AlertEffect): number {
	switch (effect) {
		case 'ACCESSIBILITY_ISSUE':
		case 'MODIFIED_SERVICE':
		case 'REALTIME_INFO_ISSUE':
			return 0;
		case 'ADDITIONAL_SERVICE':
			return 1;
		case 'DETOUR':
		case 'ON_BOARD_SALE_ISSUE':
		case 'REDUCED_SERVICE':
		case 'STOP_MOVED':
			return 2;
		case 'NO_SERVICE':
		case 'SIGNIFICANT_DELAYS':
			return 3;
	}
}

export function getAlertCardSeverityLevel(cause: AlertCause, effect: AlertEffect): 0 | 1 | 2 | 3 {
	const level = Math.max(getCauseSeverityLevel(cause), getEffectSeverityLevel(effect));
	return Math.min(3, Math.max(0, level)) as 0 | 1 | 2 | 3;
}
