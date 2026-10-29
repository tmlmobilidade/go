/* * */

import { z } from 'zod';

/* * */

export const ChangelogSeenPlatformResponseSchema = z.object({ success: z.literal(true) });
export type ChangelogSeenPlatformResponse = z.infer<typeof ChangelogSeenPlatformResponseSchema>;
