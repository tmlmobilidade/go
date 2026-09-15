/* * */

import { GtfsStopTimesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const OperationPostersV1StopTimesSchema = z.object({
	...GtfsStopTimesSchema.shape,
});

export type OperationPostersV1StopTimes = z.output<typeof OperationPostersV1StopTimesSchema>;
