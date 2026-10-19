/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OperationRidesV1ExtractionPropertiesSchema = z.object({

	agency_ids: z
		.array(z.string())
		.default([]),

	start_time_scheduled_end: UnixMillisecondsSchema,

	start_time_scheduled_start: UnixMillisecondsSchema,

});

export type OperationRidesV1ExtractionProperties = z.infer<typeof OperationRidesV1ExtractionPropertiesSchema>;
