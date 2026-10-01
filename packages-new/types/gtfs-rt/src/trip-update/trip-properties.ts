/* * */

import { OperationalDateIntSchema, OperationalTimeSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsRtTripPropertiesSchema = z.object({
	shape_id: z.string().nullish(),
	start_date: OperationalDateIntSchema.nullish(),
	start_time: OperationalTimeSchema.nullish(),
	trip_headsign: z.string().nullish(),
	trip_id: z.string().nullish(),
	trip_short_name: z.string().nullish(),
});

export type GtfsRtTripProperties = z.infer<typeof GtfsRtTripPropertiesSchema>;
