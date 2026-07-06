/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GetOperationalStopsBatchQuerySchema = z.object({
	agency_ids: z.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(id => id.trim()) : [], z.array(z.string())).default([]),
	date_end: UnixTimestampSchema,
	date_start: UnixTimestampSchema,
});

/* * */

export type GetOperationalStopsBatchQuery = z.infer<typeof GetOperationalStopsBatchQuerySchema>;
