/* * */

import { z } from 'zod';

/* * */

export const GtfsRtStopTimeEventSchema = z.object({
	delay: z.number().nullish(),
	time: z.number().nullish(),
	// uncertainty: z.number().nullish(),
	// scheduled_time: z.number().nullish(),
});

export type GtfsRtStopTimeEvent = z.infer<typeof GtfsRtStopTimeEventSchema>;
