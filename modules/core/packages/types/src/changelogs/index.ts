import { ChangelogItemSchema, ChangelogReleaseSchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const ChangelogReleaseListItemSchema = ChangelogReleaseSchema.innerType().pick({
	_id: true,
	published_at: true,
	scope: true,
	status: true,
	summary: true,
	title: true,
	updated_at: true,
}).extend({ items: z.array(ChangelogItemSchema) }).transform(({ items, ...release }) => ({
	...release,
	category_counts: {
		bug_fix: items.filter(item => item.category === 'bug_fix').length,
		improvement: items.filter(item => item.category === 'improvement').length,
		new_feature: items.filter(item => item.category === 'new_feature').length,
	},
}));
export type ChangelogReleaseListItem = z.infer<typeof ChangelogReleaseListItemSchema>;

export const ChangelogManagementQuerySchema = z.object({
	status: z.enum(['draft', 'published', 'archived']).optional(),
});
export type ChangelogManagementQuery = z.infer<typeof ChangelogManagementQuerySchema>;
