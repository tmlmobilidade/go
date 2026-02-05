/* * */

import { DocumentSchema } from '@/_common/document.js';
import { StopSchema } from '@/stops/stop.js';
import { z } from 'zod';

import { PatternUpdateRulesSchema, ScheduleRuleSchema } from './scheduleRule.js';

/* * */

export const directionOptions = [
	{ label: 'Ida', value: '0' },
	{ label: 'Volta', value: '1' },
];

/* * */

export const PathSchema = z.object({
	_id: z.string(),
	allow_drop_off: z.boolean().default(true),
	allow_pickup: z.boolean().default(true),
	distance_delta: z.number().nullable().default(null),
	stop: StopSchema.nullable().optional(),
	stop_id: z.string(),
	timepoint: z.boolean().default(true),
	zones: z.array(z.string()).optional(),
});

/* * */

export const PatternSchema = DocumentSchema.extend({
	code: z.string().trim().min(1).max(10),
	destination: z.string().trim().min(1).max(100),
	direction: z.enum(['0', '1']).default('0'),
	headsign: z.string().trim().min(1).max(100),
	is_locked: z.boolean().default(false),
	line_id: z.string(),
	origin: z.string().trim().min(1).max(100),
	path: z.array(PathSchema).optional(),
	presets: z.object({
		dwell_time: z.number().default(0),
		velocity: z.number().default(20),
	}).optional(),
	route_id: z.string(),
	rules: z.array(ScheduleRuleSchema).optional().default([]),
	shape: z.object({
		extension: z.number(),
		geojson: z.object({
			geometry: z.object({
				coordinates: z.array(z.array(z.number())),
				type: z.string().default('LineString'),
			}),
			properties: z.object({}).optional(),
			type: z.string().default('Feature'),
		}),
	}).optional(),
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

export type PatternSimplified = z.infer<typeof PatternSimplifiedSchema>;

export type Path = z.infer<typeof PathSchema>;

/* * */

/**
 * Pattern with populated stop data (returned by API)
 */
// export interface PatternWithStops extends Pattern {
// 	path?: (Path & {
// 		stop?: null | {
// 			_id: string
// 			latitude: number
// 			longitude: number
// 			name: string
// 		}
// 	})[]
// }
