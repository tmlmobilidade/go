import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { ContentModuleIdSchema } from '../platform/content-scope.js';
import { ChangelogSchema } from './changelog.js';

/* * */

export const ChangelogsQuerySchema = z.object({
	module_id: ContentModuleIdSchema.optional(),
});
export type ChangelogsQuery = z.infer<typeof ChangelogsQuerySchema>;

export const MarkChangelogSeenSchema = z.object({
	release_ids: z.array(z.string().min(1)).min(1).max(100).refine(ids => new Set(ids).size === ids.length, 'Release IDs must be unique'),
});
export type MarkChangelogSeenDto = z.infer<typeof MarkChangelogSeenSchema>;

// Reader responses exclude editorial audit and publication controls.
export const ChangelogReaderSchema = ChangelogSchema.innerType().pick({
	_id: true, items: true, published_at: true, scope: true, summary: true, title: true,
}).extend({ is_seen: z.boolean(), published_at: UnixMillisecondsSchema });
export type ChangelogReader = z.infer<typeof ChangelogReaderSchema>;

export const ChangelogSummarySchema = ChangelogReaderSchema.omit({ items: true }).extend({
	category_counts: z.object({ bug_fix: z.number().int().nonnegative(), improvement: z.number().int().nonnegative(), new_feature: z.number().int().nonnegative() }),
});
export type ChangelogSummary = z.infer<typeof ChangelogSummarySchema>;

export const MarkChangelogSeenResultSchema = z.object({ success: z.literal(true) });
export type MarkChangelogSeenResult = z.infer<typeof MarkChangelogSeenResultSchema>;
