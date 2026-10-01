/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { z } from 'zod';

/* * */

export const StopsCreateRequestSchema = StopSchema.pick({
	latitude: true,
	longitude: true,
	name: true,
});

export type StopsCreateRequest = z.infer<typeof StopsCreateRequestSchema>;
