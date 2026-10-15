/* * */

import { SeverityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { GtfsValidatorRuleIdSchema } from './rule-ids.js';

/* * */

export const GtfsValidatiorRuleSchema = z.object({
	depends_on: z.array(GtfsValidatorRuleIdSchema).default([]),
	editable: z.boolean().default(true),
	severity: SeverityStatusSchema,
});

export type GtfsValidatiorRule = z.infer<typeof GtfsValidatiorRuleSchema>;
