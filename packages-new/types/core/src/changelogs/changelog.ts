import { BaseDocumentSchema, PublishStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { ContentPublicationSchema, validateContentPublication } from '../platform/content-publication.js';
import { ContentScopeSchema } from '../platform/content-scope.js';

/* * */

export const ChangelogItemCategoryValues = ['new_feature', 'improvement', 'bug_fix'] as const;
export const ChangelogItemCategorySchema = z.enum(ChangelogItemCategoryValues);
export type ChangelogItemCategory = z.infer<typeof ChangelogItemCategorySchema>;

export const ChangelogItemSchema = z.object({
	_id: z.string().trim().min(1),
	category: ChangelogItemCategorySchema,
	description: z.string().trim().nullable().default(null),
	title: z.string().trim().min(1),
});

export type ChangelogItem = z.infer<typeof ChangelogItemSchema>;

const ChangelogReleaseContentSchema = z.object({
	items: z.array(ChangelogItemSchema).default([]).refine(items => new Set(items.map(item => item._id)).size === items.length, 'Change item IDs must be unique within a release'),
	scope: ContentScopeSchema,
	summary: z.string().trim().default(''),
	title: z.string().trim().default(''),
});

export const ChangelogReleaseSchema = BaseDocumentSchema
	.merge(ContentPublicationSchema)
	.merge(ChangelogReleaseContentSchema)
	.superRefine((document, context) => {
		validateContentPublication(document, context);
		if (document.status !== 'published') return;
		if (!document.title) context.addIssue({ code: z.ZodIssueCode.custom, message: 'A published release requires a title', path: ['title'] });
		if (!document.summary) context.addIssue({ code: z.ZodIssueCode.custom, message: 'A published release requires a summary', path: ['summary'] });
		if (!document.items.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'A published release requires at least one change', path: ['items'] });
	});

// Creation starts as a draft; updates can change status, but not audit metadata or locks.
export const CreateChangelogReleaseSchema = ChangelogReleaseContentSchema;
export const UpdateChangelogReleaseSchema = ChangelogReleaseContentSchema.partial().extend({ status: PublishStatusSchema.optional() });

export type ChangelogRelease = z.infer<typeof ChangelogReleaseSchema>;
export type CreateChangelogReleaseDto = z.infer<typeof CreateChangelogReleaseSchema>;
export type UpdateChangelogReleaseDto = z.infer<typeof UpdateChangelogReleaseSchema>;
