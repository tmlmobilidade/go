/* * */

import { GtfsValidationOutputTranslationSchema } from '@/output/translation.js';
import { z } from 'zod';

/* * */

export const GtfsValidationOutputMessageSchema = z.object({
	message: z.string(),
	rows: z.array(z.int().positive()),
	translation: GtfsValidationOutputTranslationSchema.optional(),
});

export type GtfsValidationOutputMessage = z.infer<typeof GtfsValidationOutputMessageSchema>;
