import { PublishStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const ContentPublicationSchema = z.object({
	published_at: UnixMillisecondsSchema.nullable().default(null),
	published_by: z.string().trim().min(1).nullable().default(null),
	status: PublishStatusSchema.default('draft'),
});

/** Publication metadata is server-owned and retained when content is unpublished. */
export function validateContentPublication(document: z.infer<typeof ContentPublicationSchema>, context: z.RefinementCtx): void {
	if ((document.published_at === null) !== (document.published_by === null)) {
		context.addIssue({ code: z.ZodIssueCode.custom, message: 'Publication time and author must be provided together', path: ['published_at'] });
	}
	if (document.status === 'published' && document.published_at === null) {
		context.addIssue({ code: z.ZodIssueCode.custom, message: 'Published content requires publication metadata', path: ['published_at'] });
	}
}
