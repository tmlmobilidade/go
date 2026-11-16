/* * */

import { CreateYearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { validationParams } from '@tmlmobilidade/go-utils-validation';
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
		context.addIssue({ code: 'custom', ...validationParams('custom.dates.period_required'), path: ['yearPeriodId'] });
	}
	if (values.assignmentMode === 'create' && !values.newPeriodName.trim()) {
		context.addIssue({ code: 'custom', ...validationParams('custom.dates.period_name'), path: ['newPeriodName'] });
	}
});

export type PeriodsAssignmentForm = z.infer<typeof PeriodsAssignmentFormSchema>;
