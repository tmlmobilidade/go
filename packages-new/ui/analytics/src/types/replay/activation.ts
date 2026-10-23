import { z } from 'zod';

/* * */

/** Change this ID in the flag payload to authorize another support capture. */
export const AnalyticsReplayActivation = z.object({
	activationId: z.string().trim().min(1),
});

export type AnalyticsReplayActivation = z.infer<typeof AnalyticsReplayActivation>;
