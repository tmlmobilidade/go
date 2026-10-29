/* * */

import { BaseDocumentSchema, ModuleScopeSchema, PublishStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { BannerKindSchema } from './kind.js';
import { BannerLinkSchema } from './link.js';
import { BannerSeveritySchema } from './severity.js';

/* * */

function validateBannerSchedule(document: { ends_at?: null | number, starts_at?: null | number }, context: z.RefinementCtx): void {
	if (document.starts_at != null && document.ends_at != null && document.ends_at <= document.starts_at) {
		context.addIssue({ code: z.ZodIssueCode.custom, message: 'The end must be after the start', path: ['ends_at'] });
	}
}

export const BannerSchema = BaseDocumentSchema.extend({
	dismissal_version: z.number().int().positive().default(1),
	dismissible: z.boolean().default(false),
	ends_at: UnixMillisecondsSchema.nullable().default(null),
	kind: BannerKindSchema,
	link: BannerLinkSchema.nullable().default(null),
	message: z.string().trim().min(1),
	publish_status: PublishStatusSchema.default('draft'),
	scope: ModuleScopeSchema,
	severity: BannerSeveritySchema.default('info'),
	starts_at: UnixMillisecondsSchema.nullable().default(null),
	title: z.string().trim().min(1),
}).superRefine(validateBannerSchedule);

export const CreateBannerSchema = BannerSchema.innerType().omit({ _id: true, created_at: true, created_by: true, dismissal_version: true, is_locked: true, publish_status: true, updated_at: true, updated_by: true }).superRefine(validateBannerSchedule);
export const UpdateBannerSchema = CreateBannerSchema.innerType().partial().extend({ publish_status: PublishStatusSchema.optional() }).superRefine(validateBannerSchedule);

export type Banner = z.infer<typeof BannerSchema>;
export type CreateBannerDto = z.infer<typeof CreateBannerSchema>;
export type UpdateBannerDto = z.infer<typeof UpdateBannerSchema>;
