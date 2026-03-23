/* * */

import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventBaseSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	created_at: UnixTimeStampSchema,
	entity_id: z.string(),
	received_at: UnixTimeStampSchema,
	version: z.string(),
});
