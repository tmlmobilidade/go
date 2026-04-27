/* * */

import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const GetOperationalStopsBatchQuerySchema = z.object({
	agency_ids: z.preprocess((val: string) => (val && typeof val === 'string') ? val.split(',').map(id => id.trim()) : [], z.array(z.string())).default([]),
	date_end: UnixTimeStampSchema,
	date_start: UnixTimeStampSchema,
});

/* * */

export type GetOperationalStopsBatchQuery = z.infer<typeof GetOperationalStopsBatchQuerySchema>;
