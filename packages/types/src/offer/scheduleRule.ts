// interface Rule {
//   operatingMode: 'include' | 'exclude'; // include = schedules operate, exclude = schedules do not operate

//   periodIds: string[]; // e.g., ["escolar", "ferias"]

//   weekdays?: string[]; // ["Mon", "Tue", ...], optional

//   holidays?: {
//     all?: boolean;          // applies to all holidays
//     specific?: string[];    // holidayIds this rule applies to
//   };

//   events?: string[]; // list of event IDs or names this rule applies to

//   travelTime?: string; // optional travel info
// }

import { z } from 'zod';

/* * */

export enum OPERATING_MODE {
	EXCLUDE = 'exclude',
	INCLUDE = 'include',
}

export enum WEEKDAYS {
	Fri = 5,
	Mon = 1,
	Sat = 6,
	Sun = 0,
	Thu = 4,
	Tue = 2,
	Wed = 3,
}

export const WEEKDAY_OPTIONS = [
	{ label: 'Seg', value: WEEKDAYS.Mon },
	{ label: 'Ter', value: WEEKDAYS.Tue },
	{ label: 'Qua', value: WEEKDAYS.Wed },
	{ label: 'Qui', value: WEEKDAYS.Thu },
	{ label: 'Sex', value: WEEKDAYS.Fri },
	{ label: 'Sáb', value: WEEKDAYS.Sat },
	{ label: 'Dom', value: WEEKDAYS.Sun },
] as const;

// Holidays schema
const HolidaysSchema = z.discriminatedUnion('mode', [
	z.object({
		mode: z.literal('ignore'),
	}),
	z.object({
		mode: z.literal('all'),
	}),
	z.object({
		ids: z.array(z.string()).min(1),
		mode: z.literal('specific'),
	}),
]);

/* * */

export const ScheduleRuleSchema = z.object({
	operatingMode: z.nativeEnum(OPERATING_MODE),

	// Can reference multiple periods by ID
	periodIds: z.array(z.string()).optional(),

	// Optional weekdays filter
	weekdays: z.array(z.nativeEnum(WEEKDAYS)).optional(),

	// Optional holidays filter
	holidays: HolidaysSchema.optional(),

	// Optional events
	events: z.array(z.string()).optional(),

	// Optional travel time
	travelTime: z.string().optional(),

	// Optional timepoints when this rule applies (HH:mm format)
	timePoints: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)).optional(),
});

/* * */

export type ScheduleRule = z.infer<typeof ScheduleRuleSchema>;
