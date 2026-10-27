import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

/** One record per user/banner, replaced when a newer version is dismissed. */
export const BannerDismissalSchema = z.object({
	_id: z.string().min(1),
	banner_id: z.string().min(1),
	dismissal_version: z.number().int().positive(),
	dismissed_at: UnixMillisecondsSchema,
	user_id: z.string().min(1),
});

export type BannerDismissal = z.infer<typeof BannerDismissalSchema>;
