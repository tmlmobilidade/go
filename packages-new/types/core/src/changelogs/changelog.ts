/* * */

import { BaseDocumentSchema, ModuleScopeSchema, partialWithoutDefaults, PublishStatusSchema } from '@tmlmobilidade/go-types-shared';
import { validationParams } from '@tmlmobilidade/go-utils-validation';
import { z } from 'zod';

import { ChangelogItemSchema } from './item.js';

/* * */

export const ChangelogSchema = BaseDocumentSchema.extend({
	items: z.array(ChangelogItemSchema).default([]).refine(items => new Set(items.map(item => item._id)).size === items.length, validationParams('custom.unique.changelog_items')),
	publish_status: PublishStatusSchema.default('draft'),
	scope: ModuleScopeSchema,
	summary: z.string().trim().default(''),
	title: z.string().trim().min(1),
});

export const CreateChangelogSchema = ChangelogSchema.omit({ _id: true, created_at: true, created_by: true, is_locked: true, publish_status: true, updated_at: true, updated_by: true });
export const UpdateChangelogSchema = partialWithoutDefaults(CreateChangelogSchema).extend({ publish_status: PublishStatusSchema.optional() });

export type Changelog = z.infer<typeof ChangelogSchema>;
export type CreateChangelogDto = z.infer<typeof CreateChangelogSchema>;
export type UpdateChangelogDto = z.infer<typeof UpdateChangelogSchema>;
