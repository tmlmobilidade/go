/* * */

import { z } from 'zod';

import { ChangelogCategoryCountsPlatformResponseSchema } from './changelog-category-counts-platform-response.js';
import { ChangelogPlatformResponseSchema } from './changelog-platform-response.js';

/* * */

export const ChangelogSummaryPlatformResponseSchema = ChangelogPlatformResponseSchema.omit({ items: true }).extend({
	category_counts: ChangelogCategoryCountsPlatformResponseSchema,
});
export type ChangelogSummaryPlatformResponse = z.infer<typeof ChangelogSummaryPlatformResponseSchema>;
