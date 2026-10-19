/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RawVehicleEventBaseSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	created_at: UnixMillisecondsSchema,
	entity_id: z.string(),
	received_at: UnixMillisecondsSchema,
	version: z.string(),
});
