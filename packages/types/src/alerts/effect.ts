/* * */

import { type GtfsEffect } from '@/gtfs/effect.js';
import z from 'zod';

/* * */

export const AlertEffectValues = [

	//
	// Standard

	'ACCESSIBILITY_ISSUE',
	'ADDITIONAL_SERVICE',
	'DETOUR',
	'NO_SERVICE',
	'REDUCED_SERVICE',
	'SIGNIFICANT_DELAYS',
	'STOP_MOVED',

	//
	// Extended

	'REALTIME_INFO_ISSUE',
	'ON_BOARD_SALE_ISSUE',

] as const;

export const AlertEffectSchema = z.enum(AlertEffectValues);

/**
 * The Alert extended effect types.
 * This types represents the allowed values for the effect of a service alert
 * in the application, which are a subset of the standard GTFS-RT effects and
 * additional operational effects specific to the application's context.
 */
export type AlertEffect = z.infer<typeof AlertEffectSchema>;

/**
 * Mapping from AlertEffect to GtfsEffect.
 * This mapping is used to convert extended alert effects
 * to their corresponding standard GTFS-RT effect types.
 */
export const AlertEffectToGtfsEffectMap: Record<AlertEffect, GtfsEffect> = {
	ACCESSIBILITY_ISSUE: 'ACCESSIBILITY_ISSUE',
	ADDITIONAL_SERVICE: 'ADDITIONAL_SERVICE',
	DETOUR: 'DETOUR',
	NO_SERVICE: 'NO_SERVICE',
	ON_BOARD_SALE_ISSUE: 'OTHER_EFFECT',
	REALTIME_INFO_ISSUE: 'OTHER_EFFECT',
	REDUCED_SERVICE: 'REDUCED_SERVICE',
	SIGNIFICANT_DELAYS: 'SIGNIFICANT_DELAYS',
	STOP_MOVED: 'STOP_MOVED',
};
