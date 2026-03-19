import { OperationalDateSchema } from '@/_common/operational-date.js';
import { HHMMSchema, WEEKDAYS } from '@/dates/common.js';
import { z } from 'zod';

/* * */

export const OperatingModeValues = [
	'exclude',
	'include',
] as const;

export const OperatingModeSchema = z.enum(OperatingModeValues);
export type OperatingMode = z.infer<typeof OperatingModeSchema>;

/* * */

export const LinesModeValues = [
	'all',
	'exclude',
	'include',
] as const;

export const LinesModeSchema = z.enum(LinesModeValues);
export type LinesMode = z.infer<typeof LinesModeSchema>;

/* * */

export const ManualRuleSchema = z.object({
	_id: z.string(),

	event_id: z.string().optional(),

	kind: z.literal('manual'),
	name: z.string().optional(),

	operating_mode: OperatingModeSchema,
	timepoints: z.array(HHMMSchema),

	weekdays: z.array(z.nativeEnum(WEEKDAYS)),

	year_period_ids: z.array(z.string()),
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

	timepoints: z.array(HHMMSchema).optional(), // UI generated
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

	weekdays: z.array(z.nativeEnum(WEEKDAYS)),
	year_period_ids: z.array(z.string()),
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
