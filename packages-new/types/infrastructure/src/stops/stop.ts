/* * */

import { StopAmenitiesSchema } from '@/stops/amenities.js';
import { StopChecksSchema } from '@/stops/checks.js';
import { StopConnectionSchema } from '@/stops/connections.js';
import { StopEquipmentSchema } from '@/stops/equipment.js';
import { StopFacilitySchema } from '@/stops/facilities.js';
import { StopFlagSchema } from '@/stops/flag.js';
import { StopInfrastructureSchema } from '@/stops/infrastructure.js';
import { StopJurisdictionSchema } from '@/stops/jurisdiction.js';
import { StopShelterSchema } from '@/stops/shelter.js';
import { StopIdSchema } from '@/stops/stop-id.js';
import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { LocationSchema } from '@tmlmobilidade/go-types-locations';
import { BaseDocumentSchema, CommentSchema, LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const StopSchema = BaseDocumentSchema.extend({

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
	previous_go_id: z.string().nullable().default(null),
	short_name: z.string().min(2).max(55),
	tts_hash: z.string().nullable().default(null),
	tts_name: z.string().nullable().default(null),

	//
	// Location

	latitude: LatitudeSchema,
	location: LocationSchema,
	longitude: LongitudeSchema,

	//
	// Infrastructure

	infrastructure: StopInfrastructureSchema,

	//
	// Shelter

	shelter: StopShelterSchema,

	//
	// Checks

	checks: StopChecksSchema,

	//
	// Facilities

	connections: z.array(StopConnectionSchema).default([]),
	facilities: z.array(StopFacilitySchema).default([]),

	//
	// Equipments

	equipment: z.array(StopEquipmentSchema).default([]),

	//
	// Amenities

	amenities: StopAmenitiesSchema,

	//
	// Images & Files

	file_ids: z.array(z.string()).default([]),
	image_ids: z.array(z.string()).default([]),

	//
	// Notes & Comments

	comments: z.array(CommentSchema).default([]),
	observations: z.string().nullable().default(null),

	//
	// This field is not sent by the backend, but is useful to have in the frontend for easier access to the associated patterns of an event

	associated_patterns: z.array(z.object({
		_id: z.string(),
		code: z.string(),
		headsign: z.string(),
		line_id: z.string(),
		route_id: z.string(),
	})).default([]),

});

export const CreateStopSchema = StopSchema.omit({ _id: true, associated_patterns: true, created_at: true, updated_at: true });
export const UpdateStopSchema = CreateStopSchema.omit({ created_by: true }).partial();

export type Stop = z.infer<typeof StopSchema>;
export type CreateStopDto = z.infer<typeof CreateStopSchema>;
export type UpdateStopDto = z.infer<typeof UpdateStopSchema>;
