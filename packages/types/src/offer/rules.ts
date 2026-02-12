import { OperationalDateSchema } from '@/_common/operational-date.js';
import { WEEKDAYS } from '@/dates/date.js';
import { z } from 'zod';

/* * */

export enum OPERATING_MODE {
	EXCLUDE = 'exclude',
	INCLUDE = 'include',
}

const HHMM = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);

export const LinesModeSchema = z.enum(['all', 'include', 'exclude']);
export type LinesMode = z.infer<typeof LinesModeSchema>;

/* * */

export const ManualScheduleRuleSchema = z.object({
	// stable id for UI dedupe
	_id: z.string().optional(),

	kind: z.literal('manual'),
	name: z.string().optional(),

	operatingMode: z.nativeEnum(OPERATING_MODE),

	periodIds: z.array(z.string()).optional(),
	timePoints: z.array(HHMM),

	travelTime: z.string().optional(),

	weekdays: z.array(z.nativeEnum(WEEKDAYS)).optional(),
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

	timePoints: z.array(HHMM).optional(), // UI generated
});

export const EventDerivedRestrictionSchema = EventDerivedBaseSchema.extend({
	event: z.object({
		all_day: z.boolean(),
		end_time: HHMM,
		id: z.string(),
		start_time: HHMM,
		title: z.string(),
	}),

	kind: z.literal('event_restriction'),
});

export const EventDerivedReplacementSchema = EventDerivedBaseSchema.extend({
	event: z.object({
		id: z.string(),
		title: z.string(),
	}),

	kind: z.literal('event_replacement'),

	periodIds: z.array(z.string()),
	weekdays: z.array(z.nativeEnum(WEEKDAYS)),
});

export const EventDerivedSchema = z.discriminatedUnion('kind', [EventDerivedRestrictionSchema, EventDerivedReplacementSchema]);

/* * */

export const ScheduleRuleSchema = z.discriminatedUnion('kind', [
	ManualScheduleRuleSchema,
	EventDerivedRestrictionSchema,
	EventDerivedReplacementSchema,
]);

export const PatternUpdateRulesSchema = z.array(ManualScheduleRuleSchema.omit({ name: true })).optional();

export type ScheduleRule = z.infer<typeof ScheduleRuleSchema>;
export type ManualScheduleRule = z.infer<typeof ManualScheduleRuleSchema>;
export type EventDerivedRestriction = z.infer<typeof EventDerivedRestrictionSchema>;
export type EventDerivedReplacement = z.infer<typeof EventDerivedReplacementSchema>;
export type EventDerivedRule = z.infer<typeof EventDerivedSchema>;
