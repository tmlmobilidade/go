/* * */

import { z } from 'zod';

/* * */

export const HubStopFlagSchema = z.object({
	agency_id: z.string(),
	stop_id: z.string(),
});

/**
 * Stop flag data for the Hub Network API.
 */
export type HubStopFlag = z.infer<typeof HubStopFlagSchema>;

