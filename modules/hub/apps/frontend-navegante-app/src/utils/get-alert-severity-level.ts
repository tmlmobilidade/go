/* * */

import { GtfsRtCause, GtfsRtEffect } from '@tmlmobilidade/go-types-gtfs-rt';

/* * */

export type AlertSeverityLevel = 'high' | 'info' | 'low' | 'medium';

const CAUSE_SEVERITY: Record<GtfsRtCause, AlertSeverityLevel> = {
	ACCIDENT: 'high',
	CONSTRUCTION: 'high',
	DEMONSTRATION: 'high',
	HOLIDAY: 'info',
	MAINTENANCE: 'medium',
	MEDICAL_EMERGENCY: 'high',
	OTHER_CAUSE: 'medium',
	POLICE_ACTIVITY: 'high',
	STRIKE: 'high',
	TECHNICAL_ISSUE: 'high',
	UNKNOWN_CAUSE: 'medium',
	WEATHER: 'high',
};

const EFFECT_SEVERITY: Record<GtfsRtEffect, AlertSeverityLevel> = {
	ACCESSIBILITY_ISSUE: 'low',
	ADDITIONAL_SERVICE: 'info',
	DETOUR: 'medium',
	MODIFIED_SERVICE: 'low',
	NO_EFFECT: 'info',
	NO_SERVICE: 'high',
	OTHER_EFFECT: 'medium',
	REDUCED_SERVICE: 'low',
	SIGNIFICANT_DELAYS: 'high',
	STOP_MOVED: 'low',
	UNKNOWN_EFFECT: 'medium',
};

/* * */

export function getCauseSeverityLevel(cause: GtfsRtCause): AlertSeverityLevel {
	return CAUSE_SEVERITY[cause];
}

export function getEffectSeverityLevel(effect: GtfsRtEffect): AlertSeverityLevel {
	return EFFECT_SEVERITY[effect];
}
