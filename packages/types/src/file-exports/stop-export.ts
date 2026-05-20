/* * */

import { AvailabilityStatusSchema, ConditionStatusSchema, LifecycleStatusSchema } from '@/_common/status.js';
import { UnixTimestampSchema } from '@/_common/unix-timestamp.js';
import { FileExportBaseSchema } from '@/file-exports/base.js';
import { StopConnectionSchema } from '@/stops/connections.js';
import { StopEquipmentSchema } from '@/stops/equipment.js';
import { StopFacilitySchema } from '@/stops/facilities.js';
import { StopFlagSchema } from '@/stops/flag.js';
import { StopJurisdictionSchema } from '@/stops/jurisdiction.js';
import { StopRoadTypeSchema } from '@/stops/road-type.js';
import { StopIdSchema } from '@/stops/stop-id.js';
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
	previous_go_id: z.string().nullable().default(null),
	short_name: z.string().min(2).max(55),
	tts_name: z.string(),

	/* LOCATION */
	/* * */
	district_id: z.string(),
	latitude: z.number(),
	locality_id: z.string().nullable().default(null),
	longitude: z.number(),
	municipality_id: z.string(),
	parish_id: z.string().nullable().default(null),

	/* INFRASTRUCTURE */
	/* * */
	bench_status: ConditionStatusSchema.default('unknown'),
	electricity_status: AvailabilityStatusSchema.default('unknown'),
	pole_status: ConditionStatusSchema.default('unknown'),
	road_type: StopRoadTypeSchema.default('unknown'),

	/* SHELTER */
	/* * */
	shelter_code: z.string().nullable().default(null),
	shelter_frame_size: z.tuple([z.number(), z.number()]).nullable().default(null),
	shelter_installation_date: UnixTimestampSchema.nullable().default(null),
	shelter_maintainer: z.string().nullable().default(null),
	shelter_make: z.string().nullable().default(null),
	shelter_model: z.string().nullable().default(null),
	shelter_status: ConditionStatusSchema.default('unknown'),

	/* CHECKS */
	/* * */
	last_infrastructure_check: UnixTimestampSchema.nullable().default(null),
	last_infrastructure_maintenance: UnixTimestampSchema.nullable().default(null),
	last_schedules_check: UnixTimestampSchema.nullable().default(null),
	last_schedules_maintenance: UnixTimestampSchema.nullable().default(null),

	/* FACILITIES */
	/* * */
	connections: z.array(StopConnectionSchema).default([]),
	facilities: z.array(StopFacilitySchema).default([]),

	/* EQUIPMENTS */
	/* * */
	equipment: z.array(StopEquipmentSchema).default([]),

	/* HAS ... */
	/* * */
	has_bench: AvailabilityStatusSchema.default('unknown'),
	has_mupi: AvailabilityStatusSchema.default('unknown'),
	has_network_map: AvailabilityStatusSchema.default('unknown'),
	has_schedules: AvailabilityStatusSchema.default('unknown'),
	has_shelter: AvailabilityStatusSchema.default('unknown'),
	has_stop_sign: AvailabilityStatusSchema.default('unknown'),

});

/* PROPERTIES SCHEMA */
/* * */
export const StopExportPropertiesSchema = z.object({
	properties: z.object({
		connections: z.array(StopConnectionSchema).optional().nullable(),

		equipment: z.array(StopEquipmentSchema).optional().nullable(),

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
