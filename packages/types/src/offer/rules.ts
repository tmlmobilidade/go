import { OperationalDateSchema } from '@/_common/operational-date.js';
import { HHMMSchema, WEEKDAYS } from '@/dates/common.js';
import { z } from 'zod';

/* * */

export enum OPERATING_MODE {
	EXCLUDE = 'exclude',
	INCLUDE = 'include',
}

export const LinesModeSchema = z.enum(['all', 'include', 'exclude']);
export type LinesMode = z.infer<typeof LinesModeSchema>;

/* * */

export const ManualRuleSchema = z.object({
	// stable id for UI dedupe
	_id: z.string().optional(),

	eventId: z.string().optional(),

	kind: z.literal('manual'),
	name: z.string().optional(),

	operatingMode: z.nativeEnum(OPERATING_MODE),
	periodIds: z.array(z.string()),

	timePoints: z.array(HHMMSchema),

	weekdays: z.array(z.nativeEnum(WEEKDAYS)),
});

/* * */

export const EventDerivedBaseSchema = z.object({
	// UI fields
	_id: z.string().optional(), // e.g. `event:${event_id}:rule:${rule_id}`
	name: z.string().optional(),

	// applies on these operational dates
	dates: z.array(OperationalDateSchema),

	lines_mode: LinesModeSchema,
	lines_to_exclude: z.array(z.string()).optional(),
	lines_to_include: z.array(z.string()).optional(),

	timePoints: z.array(HHMMSchema).optional(), // UI generated
});

export const EventRestrictionSchema = EventDerivedBaseSchema.extend({
	all_day: z.boolean(),
	end_time: HHMMSchema.default(''),
	start_time: HHMMSchema.default(''),

	// Event info
	event: z.object({
		id: z.string(),
		title: z.string(),
	}),

	kind: z.literal('event_restriction'),
});

export const EventReplacementSchema = EventDerivedBaseSchema.extend({
	event: z.object({
		id: z.string(),
		title: z.string(),
	}),

	kind: z.literal('event_replacement'),

	periodIds: z.array(z.string()),
	weekdays: z.array(z.nativeEnum(WEEKDAYS)),
});

export const EventRuleSchema = z.discriminatedUnion('kind', [EventRestrictionSchema, EventReplacementSchema]);

/* * */

export const ScheduleRuleSchema = z.discriminatedUnion('kind', [
	ManualRuleSchema,
	EventRestrictionSchema,
	EventReplacementSchema,
]);

export const PatternUpdateRulesSchema = z.array(ManualRuleSchema.omit({ name: true })).optional();

export type ScheduleRule = z.infer<typeof ScheduleRuleSchema>;
export type ManualRule = z.infer<typeof ManualRuleSchema>;
export type EventRestrictionRule = z.infer<typeof EventRestrictionSchema>;
export type EventReplacementRule = z.infer<typeof EventReplacementSchema>;
export type EventRule = z.infer<typeof EventRuleSchema>;
