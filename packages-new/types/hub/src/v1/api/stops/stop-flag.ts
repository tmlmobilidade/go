/* * */

import { z } from 'zod';

/* * */

export const HubV1ApiStopFlagSchema = z.object({
	agency_id: z.string(),
	stop_id: z.string(),
});

/**
 * Stop flag data for the Hub V1 Stops API.
 */
export type HubV1ApiStopFlag = z.infer<typeof HubV1ApiStopFlagSchema>;

