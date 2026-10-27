import { BaseDocumentSchema, PublishStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { ContentPublicationSchema, validateContentPublication } from '../platform/content-publication.js';
import { ContentScopeSchema } from '../platform/content-scope.js';

/* * */

export const OperationalBannerKindValues = ['maintenance', 'incident', 'announcement'] as const;
export const OperationalBannerKindSchema = z.enum(OperationalBannerKindValues);
export type OperationalBannerKind = z.infer<typeof OperationalBannerKindSchema>;

export const OperationalBannerSeverityValues = ['info', 'warning', 'critical'] as const;
export const OperationalBannerSeveritySchema = z.enum(OperationalBannerSeverityValues);
export type OperationalBannerSeverity = z.infer<typeof OperationalBannerSeveritySchema>;

export const OperationalBannerLinkSchema = z.object({
	label: z.string().trim().min(1),
	url: z.string().url().refine(value => /^https?:\/\//i.test(value), 'Banner links must use HTTP or HTTPS'),
});

const OperationalBannerContentSchema = z.object({
	dismissible: z.boolean().default(false),
	ends_at: UnixMillisecondsSchema.nullable().default(null),
	kind: OperationalBannerKindSchema,
	link: OperationalBannerLinkSchema.nullable().default(null),
	message: z.string().trim().default(''),
	scope: ContentScopeSchema,
	severity: OperationalBannerSeveritySchema.default('info'),
	starts_at: UnixMillisecondsSchema.nullable().default(null),
	title: z.string().trim().default(''),
});

function validateBannerSchedule(document: { ends_at?: null | number, starts_at?: null | number }, context: z.RefinementCtx): void {
	if (document.starts_at != null && document.ends_at != null && document.ends_at <= document.starts_at) {
		context.addIssue({ code: z.ZodIssueCode.custom, message: 'The end must be after the start', path: ['ends_at'] });
	}
}

export const OperationalBannerSchema = BaseDocumentSchema
	.merge(ContentPublicationSchema)
	.merge(OperationalBannerContentSchema)
	.extend({ dismissal_version: z.number().int().positive().default(1) })
	.superRefine((document, context) => {
		validateContentPublication(document, context);
		validateBannerSchedule(document, context);
		if (document.status !== 'published') return;
		if (!document.title) context.addIssue({ code: z.ZodIssueCode.custom, message: 'A published banner requires a title', path: ['title'] });
		if (!document.message) context.addIssue({ code: z.ZodIssueCode.custom, message: 'A published banner requires a message', path: ['message'] });
	});

export const CreateOperationalBannerSchema = OperationalBannerContentSchema.superRefine(validateBannerSchedule);
// Partial schedule edits are validated again against the complete stored document.
export const UpdateOperationalBannerSchema = OperationalBannerContentSchema.partial().extend({ status: PublishStatusSchema.optional() }).superRefine(validateBannerSchedule);

export type OperationalBanner = z.infer<typeof OperationalBannerSchema>;
export type CreateOperationalBannerDto = z.infer<typeof CreateOperationalBannerSchema>;
export type UpdateOperationalBannerDto = z.infer<typeof UpdateOperationalBannerSchema>;
