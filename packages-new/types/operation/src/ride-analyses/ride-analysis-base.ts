/* * */

import { GradeStatusSchema, OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisBaseSchema = z.object({
	agency_id: z.string(),
	grade_status: GradeStatusSchema,
	operational_date: OperationalDateIntSchema,
	reason: z.string().nullable().default(null),
	remarks: z.string().nullable().default(null),
	ride_id: z.string(),
	updated_at: UnixTimestampSchema,
});

export type RideAnalysisBase = z.infer<typeof RideAnalysisBaseSchema>;
