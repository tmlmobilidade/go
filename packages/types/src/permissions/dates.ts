/* * */

import { z } from 'zod';

/* * */

export const AnnotationsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('annotations'),
});

export type AnnotationsPermission = z.infer<typeof AnnotationsPermissionSchema>;

/* * */

export const EventsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('events'),
});

export type EventsPermission = z.infer<typeof EventsPermissionSchema>;

/* * */

export const HolidaysPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('holidays'),
});

export type HolidaysPermission = z.infer<typeof HolidaysPermissionSchema>;

/* * */

export const YearPeriodsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('year_periods'),
});

export type YearPeriodsPermission = z.infer<typeof YearPeriodsPermissionSchema>;
