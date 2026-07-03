/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RawApexTransactionBaseSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	created_at: UnixTimestampSchema,
	is_ok: z.boolean(),
	received_at: UnixTimestampSchema,
	version: z.string(),
});
