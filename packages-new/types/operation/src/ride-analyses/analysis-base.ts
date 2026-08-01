/* * */

import { ProcessingStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisBaseSchema = z.object({
	_id: z.string(),
	created_at: UnixTimestampSchema,
	is_accepted: z.boolean(),
	processing_status: ProcessingStatusSchema,
	reason: z.string().nullable().default(null),
	remarks: z.string().nullable().default(null),
	ride_id: z.string(),
});

export type RideAnalysisBase = z.infer<typeof RideAnalysisBaseSchema>;
