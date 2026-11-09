import { ChangelogItemSchema, ChangelogSchema } from '@tmlmobilidade/go-types-core';
import { PublishStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const ChangelogListItemSchema = ChangelogSchema.pick({
	_id: true,
	publish_status: true,
	scope: true,
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
export type ChangelogListItem = z.infer<typeof ChangelogListItemSchema>;

export const ChangelogManagementQuerySchema = z.object({
	publish_status: PublishStatusSchema.optional(),
});
export type ChangelogManagementQuery = z.infer<typeof ChangelogManagementQuerySchema>;
