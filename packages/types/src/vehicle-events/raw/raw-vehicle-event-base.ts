/* * */

import { UnixTimestampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventBaseSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	created_at: UnixTimestampSchema,
	entity_id: z.string(),
	received_at: UnixTimestampSchema,
	version: z.string(),
});
