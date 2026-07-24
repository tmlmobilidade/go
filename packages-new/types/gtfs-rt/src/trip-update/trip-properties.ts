/* * */

import { GtfsDateSchema, GtfsTimeSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsRtTripPropertiesSchema = z.object({
	shape_id: z.string().nullish(),
	start_date: GtfsDateSchema.nullish(),
	start_time: GtfsTimeSchema.nullish(),
	trip_headsign: z.string().nullish(),
	trip_id: z.string().nullish(),
	trip_short_name: z.string().nullish(),
});

export type GtfsRtTripProperties = z.infer<typeof GtfsRtTripPropertiesSchema>;
