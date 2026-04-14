/* * */

import { CommentSchema } from '@/_common/comment.js';
import { DocumentSchema } from '@/_common/document.js';
import { AvailabilityStatusSchema, ConditionStatusSchema, LifecycleStatusSchema } from '@/_common/status.js';
import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { StopConnectionSchema } from '@/stops/connections.js';
import { StopEquipmentSchema } from '@/stops/equipment.js';
import { StopFacilitySchema } from '@/stops/facilities.js';
import { StopFlagSchema } from '@/stops/flag.js';
import { StopJurisdictionSchema } from '@/stops/jurisdiction.js';
import { StopRoadTypeSchema } from '@/stops/road-type.js';
import { StopIdSchema } from '@/stops/stop-id.js';
import { z } from 'zod';

/* * */

export const StopSchema = DocumentSchema.extend({

	//
	// General

	_id: StopIdSchema,
	flags: z.array(StopFlagSchema).default([]),
	is_deleted: z.boolean().default(false),
	jurisdiction: StopJurisdictionSchema.default('unknown'),
	legacy_id: z.string().nullable().default(null),
	legacy_ids: z.array(z.string()).default([]),
	lifecycle_status: LifecycleStatusSchema.default('draft'),
	name: z.string().min(2).max(100),
	new_name: z.string().min(5).max(100).nullable().default(null),
	short_name: z.string().min(2).max(55),
	tts_name: z.string(),

	//
	// Location

	district_id: z.string(),
	latitude: z.number(),
	locality_id: z.string().nullable().default(null),
	longitude: z.number(),
	municipality_id: z.string(),
	parish_id: z.string().nullable().default(null),

	//
	// Infrastructure

	bench_status: ConditionStatusSchema.default('unknown'),
	electricity_status: AvailabilityStatusSchema.default('unknown'),
	pole_status: ConditionStatusSchema.default('unknown'),
	road_type: StopRoadTypeSchema.default('unknown'),

	//
	// Shelter

	shelter_code: z.string().nullable().default(null),
	shelter_frame_size: z.tuple([z.number(), z.number()]).nullable().default(null),
	shelter_installation_date: UnixTimeStampSchema.nullable().default(null),
	shelter_maintainer: z.string().nullable().default(null),
	shelter_make: z.string().nullable().default(null),
	shelter_model: z.string().nullable().default(null),
	shelter_status: ConditionStatusSchema.default('unknown'),

	//
	// Checks

	last_infrastructure_check: UnixTimeStampSchema.nullable().default(null),
	last_infrastructure_maintenance: UnixTimeStampSchema.nullable().default(null),
	last_schedules_check: UnixTimeStampSchema.nullable().default(null),
	last_schedules_maintenance: UnixTimeStampSchema.nullable().default(null),

	//
	// Facilities

	connections: z.array(StopConnectionSchema).default([]),
	facilities: z.array(StopFacilitySchema).default([]),

	//
	// Equipments

	equipment: z.array(StopEquipmentSchema).default([]),

	// Has ...
	has_bench: AvailabilityStatusSchema.default('unknown'),
	has_mupi: AvailabilityStatusSchema.default('unknown'),
	has_network_map: AvailabilityStatusSchema.default('unknown'),
	has_schedules: AvailabilityStatusSchema.default('unknown'),
	has_shelter: AvailabilityStatusSchema.default('unknown'),
	has_stop_sign: AvailabilityStatusSchema.default('unknown'),

	//
	// Images & Files

	file_ids: z.array(z.string()).default([]),
	image_ids: z.array(z.string()).default([]),

	//
	// Notes & Comments

	comments: z.array(CommentSchema).default([]),
	observations: z.string().nullable().default(null),

});

export const CreateStopSchema = StopSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateStopSchema = CreateStopSchema.omit({ created_by: true }).partial();

export type Stop = z.infer<typeof StopSchema>;
export type CreateStopDto = z.infer<typeof CreateStopSchema>;
export type UpdateStopDto = z.infer<typeof UpdateStopSchema>;
