/* * */

import { z } from 'zod';

/* * */

export const GtfsValidationOutputMessageSchema = z.object({
	message: z.string(),
	rows: z.array(z.int().positive()),
});

export type GtfsValidationOutputMessage = z.infer<typeof GtfsValidationOutputMessageSchema>;
