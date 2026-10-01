/* * */

import { FileExportBaseSchema } from '@/base.js';
import { StopConnectionSchema, StopFacilitySchema, StopFlagSchema, StopIdSchema, StopJurisdictionSchema } from '@tmlmobilidade/go-types-infrastructure';
import { ConditionStatusSchema, LifecycleStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */
/* DATA SCHEMA */
export const FlatStopSchema = z.object({
	/* GENERAL */
	/* * */
	_id: StopIdSchema,
	flags: z.array(StopFlagSchema).default([]),
	jurisdiction: StopJurisdictionSchema.default('unknown'),
	legacy_id: z.string().nullable().default(null),
	legacy_ids: z.array(z.string()).default([]),
	lifecycle_status: LifecycleStatusSchema.default('draft'),
	name: z.string().min(2).max(100),
	new_name: z.string().min(5).max(100).nullable().default(null),
	observations: z.string().nullable().default(null),
	previous_go_id: z.string().nullable().default(null),
	short_name: z.string().min(2).max(55),
	tts_name: z.string().nullable().default(null),

	/* LOCATION */
	/* * */
	district_id: z.string(),
	latitude: z.number(),
	locality_id: z.string().nullable().default(null),
	longitude: z.number(),
	municipality_id: z.string(),
	municipality_name: z.string().nullable().optional(),
	parish_id: z.string().nullable().default(null),

	/* SHELTER */
	/* * */
	shelter_code: z.string().nullable().default(null),
	shelter_installation_date: UnixMillisecondsSchema.nullable().default(null),
	shelter_maintainer: z.string().nullable().default(null),
	shelter_make: z.string().nullable().default(null),
	shelter_model: z.string().nullable().default(null),
	shelter_status: ConditionStatusSchema.default('unknown'),

	/* FACILITIES */
	/* * */
	connections: z.array(StopConnectionSchema).default([]),
	facilities: z.array(StopFacilitySchema).default([]),

});

/* PROPERTIES SCHEMA */
/* * */
export const StopExportPropertiesSchema = z.object({
	properties: z.object({
		connections: z.array(StopConnectionSchema).optional().nullable(),

		facilities: z.array(StopFacilitySchema).optional().nullable(),

		flags: z.array(StopFlagSchema).optional().nullable(),

		jurisdiction: z.array(StopJurisdictionSchema).optional().nullable(),

		lifecycle_statuses: z.array(LifecycleStatusSchema).optional().nullable(),

		search: z.string().optional().nullable(),

		stop_ids: z.array(StopIdSchema).optional().nullable(),
	}),
	type: z.literal('stop'),
});

/* CREATE SCHEMA */
/* * */
export const StopExportSchema = FileExportBaseSchema.extend(StopExportPropertiesSchema.shape);

/* TYPES */
/* * */
export type StopExportProperties = z.infer<typeof StopExportPropertiesSchema>;
export type StopExportData = z.infer<typeof FlatStopSchema>;
