/* * */

import { z } from 'zod';

/* * */

export const ChangelogCategoryCountsPlatformResponseSchema = z.object({
	bug_fix: z.number().int().nonnegative(),
	improvement: z.number().int().nonnegative(),
	new_feature: z.number().int().nonnegative(),
});

export type ChangelogCategoryCountsPlatformResponse = z.infer<typeof ChangelogCategoryCountsPlatformResponseSchema>;
