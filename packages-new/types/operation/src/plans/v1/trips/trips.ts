/* * */

import { GtfsTripsSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const OperationPostersV1TripsSchema = z.object({
	...GtfsTripsSchema.shape,
});

export type OperationPostersV1Trips = z.output<typeof OperationPostersV1TripsSchema>;
