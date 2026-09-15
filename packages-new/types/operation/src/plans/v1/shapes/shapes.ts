/* * */

import { GtfsShapesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const OperationPostersV1ShapesSchema = z.object({
	...GtfsShapesSchema.shape,
});

export type OperationPostersV1Shapes = z.output<typeof OperationPostersV1ShapesSchema>;
