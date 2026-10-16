/* * */

import { SeverityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { GtfsValidatorRuleIdSchema } from './rule-ids.js';

/* * */

export const GtfsValidatiorRuleSchema = z.object({
	compare: z.array(z.object({
		key: z.string(),
		value: z.string(),
	})).optional(),
	depends_on: z.array(GtfsValidatorRuleIdSchema).default([]),
	options: z.array(z.string()).optional(),
	severity: SeverityStatusSchema,
});

export type GtfsValidatiorRule = z.infer<typeof GtfsValidatiorRuleSchema>;
