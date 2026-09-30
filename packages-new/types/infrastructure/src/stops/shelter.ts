/* * */

import { ConditionStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const StopShelterSchema = z.object({
	shelter_code: z.string().nullable().default(null),
	shelter_frame_size: z.tuple([z.number(), z.number()]).nullable().default(null),
	shelter_installation_date: UnixMillisecondsSchema.nullable().default(null),
	shelter_maintainer: z.string().nullable().default(null),
	shelter_make: z.string().nullable().default(null),
	shelter_model: z.string().nullable().default(null),
	shelter_status: ConditionStatusSchema.default('unknown'),
});

export type StopShelter = z.infer<typeof StopShelterSchema>;
