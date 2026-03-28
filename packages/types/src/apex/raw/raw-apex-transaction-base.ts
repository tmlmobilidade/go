/* * */

import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionBaseSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	created_at: UnixTimeStampSchema,
	is_ok: z.boolean(),
	received_at: UnixTimeStampSchema,
	transaction_id: z.string(),
	version: z.string(),
});
