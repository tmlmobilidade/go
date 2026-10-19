/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { z } from 'zod';

/* * */

export const StopsUpdateCoordinatesRequestSchema = StopSchema.pick({
	latitude: true,
	longitude: true,
});

export type StopsUpdateCoordinatesRequest = z.infer<typeof StopsUpdateCoordinatesRequestSchema>;
