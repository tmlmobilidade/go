/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const UserBannerDismissalSchema = z.object({
	banner_id: z.string().min(1),
	dismissal_version: z.number().int().positive(),
	dismissed_at: UnixMillisecondsSchema,
});

export type UserBannerDismissal = z.infer<typeof UserBannerDismissalSchema>;
