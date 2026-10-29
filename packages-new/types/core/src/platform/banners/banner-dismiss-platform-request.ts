/* * */

import { ModuleIdSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const BannerDismissPlatformRequestSchema = z.object({
	dismissal_version: z.number().int().positive(),
	module_id: ModuleIdSchema.optional(),
});
export type BannerDismissPlatformRequest = z.infer<typeof BannerDismissPlatformRequestSchema>;
