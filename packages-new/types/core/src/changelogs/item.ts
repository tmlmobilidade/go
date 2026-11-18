/* * */

import { z } from 'zod';

import { ChangelogItemCategorySchema } from './item-category.js';

/* * */

export const ChangelogItemSchema = z.object({
	_id: z.string().trim().min(1),
	category: ChangelogItemCategorySchema,
	description: z.string().trim().nullable().default(null),
	title: z.string().trim().min(1),
});

export type ChangelogItem = z.infer<typeof ChangelogItemSchema>;
