/* * */

import { OperationalDateIntSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const DemandByAgencyByOperationalDateSchema = z.object({
	agency_id: z.string(),
	operational_date: OperationalDateIntSchema,
	qty: z.number(),
	updated_at: UnixMillisecondsSchema,
});

export type DemandByAgencyByOperationalDate = z.infer<typeof DemandByAgencyByOperationalDateSchema>;
