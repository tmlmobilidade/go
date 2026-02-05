import { operationalDateSchema } from '@/_common/operational-date.js';
import { WEEKDAYS } from '@/dates/date.js';
import { z } from 'zod';

/* * */

export enum OPERATING_MODE {
	EXCLUDE = 'exclude',
	INCLUDE = 'include',
}

const HHMM = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);

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

export const EventDerivedRestrictionSchema = z.object({
	kind: z.literal('event'),
	name: z.string().optional(),

	// stable id for UI dedupe
	_id: z.string().optional(), // e.g. `event:${event_id}`

	event: z.object({
		all_day: z.boolean(),
		end_time: HHMM,
		id: z.string(),
		start_time: HHMM,
		title: z.string(),
	}),

	operatingMode: z.literal(OPERATING_MODE.EXCLUDE),
	timePoints: z.array(HHMM),

	// applies on these operational dates
	dates: z.array(operationalDateSchema),
});

/* * */

export const ScheduleRuleSchema = z.discriminatedUnion('kind', [
	ManualScheduleRuleSchema,
	EventDerivedRestrictionSchema,
]);

export const PatternUpdateRulesSchema = z.array(ManualScheduleRuleSchema.omit({ name: true })).optional();

export type ScheduleRule = z.infer<typeof ScheduleRuleSchema>;
export type ManualScheduleRule = z.infer<typeof ManualScheduleRuleSchema>;
export type EventDerivedRestriction = z.infer<typeof EventDerivedRestrictionSchema>;
