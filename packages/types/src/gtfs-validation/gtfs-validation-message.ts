/* * */

import { SeverityLevelSchema } from '@/gtfs-validation/severity-level.js';
import { z } from 'zod';

/* * */

export const GtfsValidationMessageSchema = z.object({
	field: z.string(),
	file_name: z.string(),
	message: z.string(),
	rows: z.array(z.number()),
	rule_id: z.string(),
	severity: SeverityLevelSchema,
});

export type GtfsValidationMessage = z.infer<typeof GtfsValidationMessageSchema>;
