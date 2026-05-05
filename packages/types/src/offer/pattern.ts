/* * */

import { CommentSchema } from '@/_common/comment.js';
import { DocumentSchema } from '@/_common/document.js';
import { createGtfsMapper } from '@/gtfs-new/mapper.js';
import { GtfsDirection } from '@/gtfs-new/trips.js';
import { StopIdSchema } from '@/stops/stop-id.js';
import { Stop } from '@/stops/stop.js';
import { z } from 'zod';

import { StopsParametersListSchema } from './parameters.js';
import { PatternUpdateRulesSchema, ScheduleRuleSchema } from './rules.js';

/* * */

export const PatternDirectionValues = [
	'outbound',
	'inbound',
] as const;

export const PatternDirectionSchema = z.enum(PatternDirectionValues);
export type PatternDirection = z.infer<typeof PatternDirectionSchema>;

export const patternDirectionMapper = createGtfsMapper<typeof PatternDirectionValues[number], GtfsDirection>({
	inbound: '1',
	outbound: '0',
});

export const directionOptions: { label: string, value: typeof PatternDirectionValues[number] }[] = [
	{ label: 'Ida', value: 'outbound' },
	{ label: 'Volta', value: 'inbound' },
];

/* * */

export const PathSchema = z.object({
	_id: z.string(),
	allow_drop_off: z.boolean().default(true),
	allow_pickup: z.boolean().default(true),
	distance_delta: z.number().nullable().default(null),
	stop_id: StopIdSchema,
	timepoint: z.boolean().default(true),
	zones: z.array(z.string()).optional(),
});

/* * */

const ShapeAnchorSchema = z.object({
	_id: z.string(),
	after_stop_id: StopIdSchema,
	before_stop_id: StopIdSchema,
	lat: z.number(),
	lon: z.number(),
	sequence: z.number().default(0),
	type: z.enum(['via', 'through']).default('via'),
});

const ShapeLegSchema = z.object({
	distance: z.number(),
	duration: z.number(),
	from_index: z.number(),
	geojson: z.object({
		geometry: z.object({
			coordinates: z.array(z.array(z.number())),
			type: z.string().default('LineString'),
		}),
		properties: z.object({
			distance: z.number(),
			duration: z.number(),
			from_index: z.number(),
			to_index: z.number(),
		}),
		type: z.string().default('Feature'),
	}),
	geometry: z.array(z.tuple([z.number(), z.number()])),
	to_index: z.number(),
});

export const ShapeSchema = z.object({
	anchors: z.array(ShapeAnchorSchema).optional().default([]),
	extension: z.number(),
	geojson: z.object({
		geometry: z.object({
			coordinates: z.array(z.array(z.number())),
			type: z.string().default('LineString'),
		}),
		properties: z.object({}).optional(),
		type: z.string().default('Feature'),
	}),
	legs: z.array(ShapeLegSchema).optional(),
});

/* * */

export const PatternSchema = DocumentSchema.extend({
	code: z.string().trim().min(1).max(10),

	// Activity (field changes and notes)
	comments: z.array(CommentSchema).optional().default([]),

	destination: z.string().trim().min(1).max(100),
	direction: PatternDirectionSchema.default('outbound'),
	headsign: z.string().trim().min(1).max(100),
	is_locked: z.boolean().default(false),
	line_id: z.string(),
	origin: z.string().trim().min(1).max(100),

	parameters: StopsParametersListSchema.optional(),

	path: z.array(PathSchema).optional(),
	route_id: z.string(),
	rules: z.array(ScheduleRuleSchema).optional().default([]),
	shape: ShapeSchema.optional(),
});

export const PatternSimplifiedSchema = z.object({
	_id: z.string(),
	code: z.string().trim().min(1).max(10),
	headsign: z.string().trim().min(1).max(100),
	line_id: z.string(),
	route_id: z.string(),
});

/* * */

export const CreatePatternSchema = PatternSchema.omit({ _id: true, created_at: true, updated_at: true });

export const UpdatePatternSchema = CreatePatternSchema
	.omit({ created_by: true })
	.partial()
	.extend({
		rules: PatternUpdateRulesSchema,
	});

/* * */

export type Pattern = z.infer<typeof PatternSchema>;
export type CreatePatternDto = z.infer<typeof CreatePatternSchema>;
export type UpdatePatternDto = z.infer<typeof UpdatePatternSchema>;
export type PopulatedPattern = Omit<Pattern, 'path'> & { path: PopulatedPath[] };

export type PatternSimplified = z.infer<typeof PatternSimplifiedSchema>;

export type Path = z.infer<typeof PathSchema>;
export type PopulatedPath = Path & { stop: null | Stop };

export type Shape = z.infer<typeof ShapeSchema>;

/* * */
