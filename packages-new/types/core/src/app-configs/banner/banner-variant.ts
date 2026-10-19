/* * */

import { z } from 'zod';

/* * */

export const AppConfigBannerVariantValues = [
	'danger',
	'info',
	'success',
	'warning',
] as const;

export const AppConfigBannerVariantSchema = z.enum(AppConfigBannerVariantValues);

export type AppConfigBannerVariant = z.infer<typeof AppConfigBannerVariantSchema>;
