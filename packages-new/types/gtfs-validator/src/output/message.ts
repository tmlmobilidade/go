/* * */

import { SeverityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsValidationOutputMessageSchema = z.object({
	field: z.string(),
	file_name: z.string(),
	message: z.string(),
	rows: z.array(z.number()),
	rule_id: z.string(),
	severity: SeverityStatusSchema,
});

export type GtfsValidationOutputMessage = z.infer<typeof GtfsValidationOutputMessageSchema>;
