/* * */

import { CommentSchema } from '@/_common/comment.js';
import { DocumentSchema } from '@/_common/document.js';
import { unixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

//
// Define constants for enum values for better maintainability

const JURISDICTION_VALUES = ['ip', 'municipality', 'other', 'unknown'] as const;
const STOP_LIFECYCLE_STATUS_VALUES = ['active', 'inactive', 'provisional', 'seasonal', 'voided'] as const;
const ELECTRICITY_STATUS_VALUES = ['available', 'unavailable', 'unknown'] as const;
const ROAD_TYPE_VALUES = ['complementary_itinerary', 'highway', 'main_itinerary', 'national_road', 'regional_road', 'secondary_road', 'unknown'] as const;
const INFRASTRUCTURE_STATUS_VALUES = ['not_applicable', 'unknown', 'missing', 'damaged', 'ok'] as const;
const CONNECTIONS_VALUES = ['ferry', 'light_rail', 'subway', 'train', 'boat', 'airport', 'bike_sharing', 'bike_parking', 'car_parking'] as const;
const FACILITIES_VALUES = ['fire_station', 'health_clinic', 'historic_building', 'hospital', 'police_station', 'school', 'shopping', 'transit_office', 'university', 'beach'] as const;
const HAS_ANY = ['yes', 'no', 'unknown'] as const;
const EQUIPMENT_VALUES = ['pip', 'mupi', 'mini_pip'] as const;

export const jurisdictionSchema = z.enum(JURISDICTION_VALUES);
export const stopLifecycleStatusSchema = z.enum(STOP_LIFECYCLE_STATUS_VALUES);
export const electricityStatusSchema = z.enum(ELECTRICITY_STATUS_VALUES);
export const roadTypeSchema = z.enum(ROAD_TYPE_VALUES);
export const infrastructureStatusSchema = z.enum(INFRASTRUCTURE_STATUS_VALUES);
export const connectionsSchema = z.enum(CONNECTIONS_VALUES);
export const facilitiesSchema = z.enum(FACILITIES_VALUES);
export const hasAnySchema = z.enum(HAS_ANY);
export const equipmentSchema = z.enum(EQUIPMENT_VALUES);

//
// Define types based on schemas

export type Jurisdiction = z.infer<typeof jurisdictionSchema>;
export type StopLifecycleStatus = z.infer<typeof stopLifecycleStatusSchema>;
export type ElectricityStatus = z.infer<typeof electricityStatusSchema>;
export type RoadType = z.infer<typeof roadTypeSchema>;
export type InfrastructureStatus = z.infer<typeof infrastructureStatusSchema>;
export type Connections = z.infer<typeof connectionsSchema>;
export type Facilities = z.infer<typeof facilitiesSchema>;
export type Equipment = z.infer<typeof equipmentSchema>;

export const StopSchema = DocumentSchema.extend({

	//
	// General

	_id: z.string(),
	is_archived: z.boolean().default(false),
	is_locked: z.boolean().default(false),
	jurisdiction: jurisdictionSchema,
	legacy_id: z.string().nullish(),
	lifecycle_status: stopLifecycleStatusSchema,
	name: z.string(),
	new_name: z.string().nullish(),
	short_name: z.string().nullish(),
	tts_name: z.string().nullish(),

	//
	// Location

	district_id: z.string(),
	latitude: z.number(),
	locality_id: z.string().nullish(),
	longitude: z.number(),
	municipality_id: z.string(),
	parish_id: z.string().nullish(),

	//
	// Infrastructure

	bench_status: infrastructureStatusSchema,
	electricity_status: electricityStatusSchema,
	pole_status: infrastructureStatusSchema,
	road_type: roadTypeSchema,

	//
	// Shelter

	shelter_code: z.string().nullish(),
	shelter_frame_size: z.tuple([z.number(), z.number()]).nullish(),
	shelter_installation_date: unixTimeStampSchema.nullish(),
	shelter_maintainer: z.string().nullish(),
	shelter_make: z.string().nullish(),
	shelter_model: z.string().nullish(),
	shelter_status: infrastructureStatusSchema,

	//
	// Checks

	last_infrastructure_check: unixTimeStampSchema.nullish(),
	last_infrastructure_maintenance: unixTimeStampSchema.nullish(),
	last_schedules_check: unixTimeStampSchema.nullish(),
	last_schedules_maintenance: unixTimeStampSchema.nullish(),

	//
	// Facilities

	connections: z.array(connectionsSchema),
	facilities: z.array(facilitiesSchema),

	//
	// Equipments

	equipment: z.array(equipmentSchema),

	// Has ...
	has_bench: hasAnySchema,
	has_mupi: hasAnySchema,
	has_network_map: hasAnySchema,
	has_schedules: hasAnySchema,
	has_shelter: hasAnySchema,
	has_stop_sign: hasAnySchema,

	//
	// Images & Files

	file_ids: z.array(z.string()).default([]),
	image_ids: z.array(z.string()).default([]),

	//
	// Notes & Comments

	comments: z.array(CommentSchema),
	observations: z.string().nullish(),

}).strict();

export const parentStationSchema = DocumentSchema.extend({
	_id: z.string(),
	agency_id: z.string(),
	stop_ids: z.array(z.string()),
}).strict();

export const stopAreaSchema = DocumentSchema.extend({
	_id: z.string(),
	parent_station_ids: z.array(z.string()),
}).strict();

export const CreateStopSchema = StopSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateStopSchema = CreateStopSchema.omit({ created_by: true }).partial();

//
// Define the Stop interface

export type Stop = z.infer<typeof StopSchema>;
export type CreateStopDto = z.infer<typeof CreateStopSchema>;
export type UpdateStopDto = z.infer<typeof UpdateStopSchema>;

/* * */

export const StopPermissionSchema = z.object({
	agency_ids: z.array(z.string()),
	municipality_ids: z.array(z.string()),
});

export type StopPermission = z.infer<typeof StopPermissionSchema>;
