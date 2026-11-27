import { z } from 'zod';

/* * */

export const GtfsValidationOutputTranslationSchema = z.object({
	values: z.record(z.string(), z.string()).optional(),
	variant: z.string(),
});

export type GtfsValidationOutputTranslation = z.infer<typeof GtfsValidationOutputTranslationSchema>;
