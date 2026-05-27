/* * */

import { AlertCause, AlertEffect } from '@tmlmobilidade/go-hub-pckg-types';

/* * */

export function getCauseSeverityLevel(cause: AlertCause): number {
	switch (cause) {
		case AlertCause.ACCIDENT:
		case AlertCause.CONSTRUCTION:
		case AlertCause.DEMONSTRATION:
		case AlertCause.DRIVER_ABSENCE:
		case AlertCause.DRIVER_ISSUE:
		case AlertCause.HIGH_PASSENGER_LOAD:
			return 3;
		case AlertCause.HOLIDAY:
			return 0;
		case AlertCause.MAINTENANCE:
		case AlertCause.MEDICAL_EMERGENCY:
		case AlertCause.POLICE_ACTIVITY:
		case AlertCause.ROAD_INCIDENT:
		case AlertCause.STRIKE:
		case AlertCause.SYSTEM_FAILURE:
		case AlertCause.TECHNICAL_PROBLEM:
		case AlertCause.TRAFFIC_JAM:
		case AlertCause.VEHICLE_ISSUE:
		case AlertCause.WEATHER:
			return 3;
	}
}

/* * */

export function getEffectSeverityLevel(effect: AlertEffect): number {
	switch (effect) {
		case AlertEffect.ACCESSIBILITY_ISSUE:
		case AlertEffect.MODIFIED_SERVICE:
			return 0;
		case AlertEffect.ADDITIONAL_SERVICE:
			return 1;
		case AlertEffect.DETOUR:
		case AlertEffect.NO_EFFECT:
		case AlertEffect.OTHER_EFFECT:
		case AlertEffect.REDUCED_SERVICE:
		case AlertEffect.STOP_MOVED:
		case AlertEffect.UNKNOWN_EFFECT:
			return 2;
		case AlertEffect.NO_SERVICE:
		case AlertEffect.SIGNIFICANT_DELAYS:
			return 3;
	}
}
