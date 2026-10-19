/* * */

import { UnixSecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsRtTimeRangeSchema = z.object({
	end: UnixSecondsSchema.nullish(),
	start: UnixSecondsSchema.nullish(),
});

export type GtfsRtTimeRange = z.infer<typeof GtfsRtTimeRangeSchema>;
