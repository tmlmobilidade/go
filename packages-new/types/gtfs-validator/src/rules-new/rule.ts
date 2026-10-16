/* * */

import { SeverityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { GtfsValidatorRuleIdSchema } from './rule-ids.js';

/* * */

export const GtfsValidatiorRuleSchema = z.object({
	compare: z.record(z.object(
		{
			key: z.string(),
			value: z.any(),
		},
	)).optional(),
	depends_on: z.array(GtfsValidatorRuleIdSchema).default([]),
	editable: z.boolean().default(true),
	options: z.record(z.string()).optional(),
	severity: SeverityStatusSchema,
});

export type GtfsValidatiorRule = z.infer<typeof GtfsValidatiorRuleSchema>;
