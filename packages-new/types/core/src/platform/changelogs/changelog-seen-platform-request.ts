/* * */

import { validationParams } from '@tmlmobilidade/go-utils-validation';
import { z } from 'zod';

/* * */

export const ChangelogSeenPlatformRequestSchema = z.object({
	release_ids: z.array(z.string().min(1)).min(1).max(100).refine(ids => new Set(ids).size === ids.length, validationParams('custom.unique.release_ids')),
});
export type ChangelogSeenPlatformRequest = z.infer<typeof ChangelogSeenPlatformRequestSchema>;
