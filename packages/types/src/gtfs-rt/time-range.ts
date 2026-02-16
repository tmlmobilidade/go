/* * */

import { z } from 'zod';

/* * */

export const GtfsRtTimeRangeSchema = z.object({
	end: z.number().nullish(),
	start: z.number().nullish(),
});

export type GtfsRtTimeRange = z.infer<typeof GtfsRtTimeRangeSchema>;
