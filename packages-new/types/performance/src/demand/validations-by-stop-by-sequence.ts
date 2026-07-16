/* * */

import { z } from 'zod';

/* * */

export const ValidationsByStopBySequenceSchema = z.object({
	pattern_id: z.string(),
	stop_id: z.string(),
	stop_sequence: z.number(),
	trip_id: z.string(),
	validations: z.number(),
});

export type ValidationsByStopBySequence = z.infer<typeof ValidationsByStopBySequenceSchema>;
