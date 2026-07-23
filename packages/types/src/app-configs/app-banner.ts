/* * */

import { z } from 'zod';

/* * */

export const APP_BANNER_CONFIG_ID = 'app-banner';

/* * */

export const AppBannerVariantSchema = z.enum(['danger', 'info', 'success', 'warning']);

export const AppBannerSchema = z.object({
	_id: z.literal(APP_BANNER_CONFIG_ID),
	enabled: z.boolean().default(false),
	title: z.string(),
	variant: AppBannerVariantSchema.default('info'),
});

/* * */

export type AppBanner = z.infer<typeof AppBannerSchema>;
export type AppBannerVariant = z.infer<typeof AppBannerVariantSchema>;
