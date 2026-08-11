/* * */

import { DocumentSchema, OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const YearPeriodSchema = DocumentSchema.extend({
	agency_ids: z.array(z.string()).default([]),
	code: z.string().optional(),
	color: z.string().optional(),
	dates: z.array(OperationalDateSchema).optional(),
	is_locked: z.boolean().default(false),
	name: z.string().min(1),
});

export const CreateYearPeriodSchema = YearPeriodSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateYearPeriodSchema = CreateYearPeriodSchema.omit({ created_by: true }).partial();
export const UpdateYearPeriodDatesSchema = z.object({
	add_dates: z.array(OperationalDateSchema).default([]),
	remove_dates: z.array(OperationalDateSchema).default([]),
}).superRefine((value, context) => {
	const removedDates = new Set(value.remove_dates);
	const overlappingDates = value.add_dates.filter(date => removedDates.has(date));

	if (overlappingDates.length > 0) {
		context.addIssue({
			code: z.ZodIssueCode.custom,
			message: `Dates cannot be added and removed in the same request: ${overlappingDates.join(', ')}`,
			path: ['remove_dates'],
		});
	}
});

/* * */

export type YearPeriod = z.infer<typeof YearPeriodSchema>;
export type CreateYearPeriodDto = z.infer<typeof CreateYearPeriodSchema>;
export type UpdateYearPeriodDto = z.infer<typeof UpdateYearPeriodSchema>;
export type UpdateYearPeriodDatesDto = z.infer<typeof UpdateYearPeriodDatesSchema>;
