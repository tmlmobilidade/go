/* * */

import { z } from 'zod';

import { BannerSchema } from '../../banners/banner.js';

/* * */

export const BannerPlatformResponseSchema = BannerSchema.innerType().pick({
	_id: true, dismissal_version: true, dismissible: true, ends_at: true, kind: true, link: true, message: true, scope: true, severity: true, starts_at: true, title: true,
});
export type BannerPlatformResponse = z.infer<typeof BannerPlatformResponseSchema>;
