/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RawApexTransactionBaseSchema = z.object({
	_id: z.string(),
	agency_code: z.string(),
	agency_id: z.string(),
	created_at: UnixMillisecondsSchema,
	is_ok: z.boolean(),
	received_at: UnixMillisecondsSchema,
	version: z.string(),
});
