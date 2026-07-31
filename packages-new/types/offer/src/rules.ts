import { HHMMSchema } from '@/dates/common.js';
import { MONTHS } from '@/dates/months.js';
import { WEEKDAYS } from '@/dates/weekdays.js';
import { OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
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

export const ManualRuleBaseSchema = z.object({
	_id: z.string(),
	event_id: z.string().optional(),
	kind: z.literal('manual'),
	months: z.array(z.nativeEnum(MONTHS)).optional(),
	name: z.string().optional(),
	operating_mode: OperatingModeSchema,
	timepoints: z.array(HHMMSchema),
	weekdays: z.array(z.nativeEnum(WEEKDAYS)).optional(),
	year_period_ids: z.array(z.string()),
});

export const ManualRuleSchema = ManualRuleBaseSchema.superRefine((data, ctx) => {
	if (!data.event_id) {
		if (!data.weekdays?.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Selecione pelo menos um dia da semana.',
				path: ['weekdays'],
			});
		}
		if (!data.year_period_ids?.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Selecione pelo menos um período do ano.',
				path: ['year_period_ids'],
			});
		}
	}
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

	/**
	 * When true, each date in the rule will function as its own actual weekday
	 * but within the specified year_period_ids, instead of all dates functioning
	 * as the same target weekday(s).
	 */
	same_weekday: z.boolean().optional(),

	weekdays: z.array(z.nativeEnum(WEEKDAYS)),
	year_period_ids: z.array(z.string()),
});

export const EventRuleSchema = z.discriminatedUnion('kind', [EventRestrictionSchema, EventReplacementSchema]);

/* * */

export const ScheduleRuleSchema = z.discriminatedUnion('kind', [
	ManualRuleBaseSchema,
	EventRestrictionSchema,
	EventReplacementSchema,
]);

export const PatternUpdateRuleBaseSchema = ManualRuleBaseSchema.omit({ name: true });

export const PatternUpdateRuleSchema = PatternUpdateRuleBaseSchema.superRefine((data, ctx) => {
	const hasEvent = Boolean(data.event_id);
	const hasWeekdays = Boolean(data.weekdays?.length);

	if (!hasEvent && !hasWeekdays) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Selecione pelo menos um dia da semana.',
			path: ['weekdays'],
		});
	}
});

export const PatternUpdateRulesSchema = z.array(PatternUpdateRuleSchema).optional();

export type ScheduleRule = z.infer<typeof ScheduleRuleSchema>;
export type ManualRule = z.infer<typeof ManualRuleSchema>;
export type EventRestrictionRule = z.infer<typeof EventRestrictionSchema>;
export type EventReplacementRule = z.infer<typeof EventReplacementSchema>;
export type EventRule = z.infer<typeof EventRuleSchema>;
