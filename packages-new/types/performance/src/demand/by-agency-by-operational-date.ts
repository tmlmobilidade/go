/* * */

import { OperationalDateSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const DemandByAgencyByOperationalDateSchema = z.object({
	agency_id: z.string(),
	operational_date: OperationalDateSchema,
	qty: z.number(),
	updated_at: UnixTimestampSchema,
});

export type DemandByAgencyByOperationalDate = z.infer<typeof DemandByAgencyByOperationalDateSchema>;
