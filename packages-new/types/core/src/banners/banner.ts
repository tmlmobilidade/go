import { BaseDocumentSchema, PublishStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { ContentPublicationSchema, validateContentPublication } from '../platform/content-publication.js';
import { ContentScopeSchema } from '../platform/content-scope.js';

/* * */

export const BannerKindValues = ['maintenance', 'incident', 'announcement'] as const;
export const BannerKindSchema = z.enum(BannerKindValues);
export type BannerKind = z.infer<typeof BannerKindSchema>;

export const BannerSeverityValues = ['info', 'warning', 'critical'] as const;
export const BannerSeveritySchema = z.enum(BannerSeverityValues);
export type BannerSeverity = z.infer<typeof BannerSeveritySchema>;

export const BannerLinkSchema = z.object({
	label: z.string().trim().min(1),
	url: z.string().url().refine(value => /^https?:\/\//i.test(value), 'Banner links must use HTTP or HTTPS'),
});

const BannerContentSchema = z.object({
	dismissible: z.boolean().default(false),
	ends_at: UnixMillisecondsSchema.nullable().default(null),
	kind: BannerKindSchema,
	link: BannerLinkSchema.nullable().default(null),
	message: z.string().trim().default(''),
	scope: ContentScopeSchema,
	severity: BannerSeveritySchema.default('info'),
	starts_at: UnixMillisecondsSchema.nullable().default(null),
	title: z.string().trim().default(''),
});

function validateBannerSchedule(document: { ends_at?: null | number, starts_at?: null | number }, context: z.RefinementCtx): void {
	if (document.starts_at != null && document.ends_at != null && document.ends_at <= document.starts_at) {
		context.addIssue({ code: z.ZodIssueCode.custom, message: 'The end must be after the start', path: ['ends_at'] });
	}
}

export const BannerSchema = BaseDocumentSchema
	.merge(ContentPublicationSchema)
	.merge(BannerContentSchema)
	.extend({ dismissal_version: z.number().int().positive().default(1) })
	.superRefine((document, context) => {
		validateContentPublication(document, context);
		validateBannerSchedule(document, context);
		if (document.status !== 'published') return;
		if (!document.title) context.addIssue({ code: z.ZodIssueCode.custom, message: 'A published banner requires a title', path: ['title'] });
		if (!document.message) context.addIssue({ code: z.ZodIssueCode.custom, message: 'A published banner requires a message', path: ['message'] });
	});

export const CreateBannerSchema = BannerContentSchema.superRefine(validateBannerSchedule);
// Partial schedule edits are validated again against the complete stored document.
export const UpdateBannerSchema = BannerContentSchema.partial().extend({ status: PublishStatusSchema.optional() }).superRefine(validateBannerSchedule);

export type Banner = z.infer<typeof BannerSchema>;
export type CreateBannerDto = z.infer<typeof CreateBannerSchema>;
export type UpdateBannerDto = z.infer<typeof UpdateBannerSchema>;
