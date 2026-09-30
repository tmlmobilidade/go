/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const StopChecksSchema = z.object({
	last_infrastructure_check: UnixMillisecondsSchema.nullable().default(null),
	last_infrastructure_maintenance: UnixMillisecondsSchema.nullable().default(null),
	last_schedules_check: UnixMillisecondsSchema.nullable().default(null),
	last_schedules_maintenance: UnixMillisecondsSchema.nullable().default(null),
});

export type StopChecks = z.infer<typeof StopChecksSchema>;
