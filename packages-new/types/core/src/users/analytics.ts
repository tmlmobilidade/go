/* * */

import { z } from 'zod';

/* * */

export const UserAnalyticsSchema = z.object({
	session_replay_enabled: z.boolean(),
});

export type UserAnalytics = z.infer<typeof UserAnalyticsSchema>;
