/* * */

import { OperationalDateIntSchema, ProcessingStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisBaseSchema = z.object({
	agency_id: z.string(),
	is_accepted: z.boolean(),
	operational_date: OperationalDateIntSchema,
	processing_status: ProcessingStatusSchema,
	reason: z.string().nullable().default(null),
	remarks: z.string().nullable().default(null),
	ride_id: z.string(),
	updated_at: UnixTimestampSchema,
});

export type RideAnalysisBase = z.infer<typeof RideAnalysisBaseSchema>;
