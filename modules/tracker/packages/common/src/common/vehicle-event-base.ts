/* * */

import { UnixTimeStampSchema } from '@tmlmobilidade/types';
import { z } from 'zod';

/* * */

export const TrackerVehicleEventBaseSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	created_at: UnixTimeStampSchema,
	entity_id: z.string(),
	received_at: UnixTimeStampSchema,
	version: z.string(),
});
