import { BusinessPeriodSchema } from '@/calendar/businessPeriods.js';
import { WEEKDAYS } from '@/dates/date.js';
import { z } from 'zod';

/* * */

const StopsParameterCommonSchema = z.object({
	// stable id for UI dedupe
	_id: z.string().optional(),

	name: z.string().optional(),
	path: z.array(z.object({
		avg_speed: z.number(),
		dwell_time: z.number(),
		stop_id: z.string(),
	})),
	vehicle_type: z.string().optional(),
});

export const StopsParameterDefaultSchema = StopsParameterCommonSchema.extend({
	kind: z.literal('default'),
});

export const StopsParameterOverrideSchema = StopsParameterCommonSchema.extend({
	business_periods: z.array(BusinessPeriodSchema).optional(),
	kind: z.literal('override'),
	periodIds: z.array(z.string()),
	weekdays: z.array(z.nativeEnum(WEEKDAYS)),

});

/* * */

export const StopsParameterSchema = z.discriminatedUnion('kind', [
	StopsParameterDefaultSchema,
	StopsParameterOverrideSchema,
]);

export type StopsParameter = z.infer<typeof StopsParameterSchema>;
export type StopsParameterOverride = z.infer<typeof StopsParameterOverrideSchema>;

/* * */

export const StopsParametersListSchema = z
	.array(StopsParameterSchema)
	.superRefine((items, ctx) => {
		const defaults = items.filter(i => i.kind === 'default');
		if (defaults.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'É obrigatório existir um parâmetro "default".',
			});
		}
		if (defaults.length > 1) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Só pode existir um parâmetro "default".',
			});
		}
	});

/* * */
