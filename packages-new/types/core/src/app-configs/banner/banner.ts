/* * */

import { z } from 'zod';

import { AppConfigBannerIdSchema } from './banner-id.js';
import { AppConfigBannerVariantSchema } from './banner-variant.js';

/* * */

export const AppConfigBannerSchema = z.object({
	_id: AppConfigBannerIdSchema,
	enabled: z.boolean().default(false),
	title: z.string(),
	variant: AppConfigBannerVariantSchema.default('info'),
});

export type AppConfigBanner = z.infer<typeof AppConfigBannerSchema>;
