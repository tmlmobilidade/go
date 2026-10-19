/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { z } from 'zod';

/* * */

export const StopsGetLocationRequestSchema = z.object({
	latitude: LatitudeSchema,
	longitude: LongitudeSchema,
});

export type StopsGetLocationRequest = z.infer<typeof StopsGetLocationRequestSchema>;
