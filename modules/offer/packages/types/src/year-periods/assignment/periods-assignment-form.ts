/* * */

import { CreateYearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

/* * */

/** Frontend assignment state; converted to create/update contracts before API writes. */
export const PeriodsAssignmentFormSchema = z.object({
	agency_ids: CreateYearPeriodSchema.shape.agency_ids,
	assignmentMode: z.enum(['create', 'existing']),
	color: CreateYearPeriodSchema.shape.color,
	newPeriodName: z.string(),
	yearPeriodId: z.string(),
}).superRefine((values, context) => {
	if (values.assignmentMode === 'existing' && !values.yearPeriodId) {
		context.addIssue({ code: z.ZodIssueCode.custom, message: 'Select a period', path: ['yearPeriodId'] });
	}
	if (values.assignmentMode === 'create' && !values.newPeriodName.trim()) {
		context.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a period name', path: ['newPeriodName'] });
	}
});

export type PeriodsAssignmentForm = z.infer<typeof PeriodsAssignmentFormSchema>;
