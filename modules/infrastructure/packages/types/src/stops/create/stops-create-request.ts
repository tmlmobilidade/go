/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { z } from 'zod';

/* * */

export const StopsCreateRequestSchema = StopSchema.pick({
	latitude: true,
	longitude: true,
	name: true,
}).extend({
	agency_ids: z.array(z.string().min(1)).default([]),
});

export type StopsCreateRequest = z.infer<typeof StopsCreateRequestSchema>;
