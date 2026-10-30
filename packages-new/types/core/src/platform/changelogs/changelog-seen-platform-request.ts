/* * */

import { z } from 'zod';

/* * */

export const ChangelogSeenPlatformRequestSchema = z.object({
	release_ids: z.array(z.string().min(1)).min(1).max(100).refine(ids => new Set(ids).size === ids.length, 'Release IDs must be unique'),
});
export type ChangelogSeenPlatformRequest = z.infer<typeof ChangelogSeenPlatformRequestSchema>;
