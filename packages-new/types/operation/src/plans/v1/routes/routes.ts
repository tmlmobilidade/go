/* * */

import { GtfsRoutesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const OperationPostersV1RoutesSchema = z.object({
	...GtfsRoutesSchema.shape,
});

export type OperationPostersV1Routes = z.output<typeof OperationPostersV1RoutesSchema>;
