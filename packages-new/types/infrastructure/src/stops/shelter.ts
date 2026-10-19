/* * */

import { ConditionStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const StopShelterSchema = z.object({
	code: z.string().nullable().default(null),
	installation_date: UnixMillisecondsSchema.nullable().default(null),
	maintainer: z.string().nullable().default(null),
	make: z.string().nullable().default(null),
	model: z.string().nullable().default(null),
	status: ConditionStatusSchema.default('unknown'),
});

export type StopShelter = z.infer<typeof StopShelterSchema>;
