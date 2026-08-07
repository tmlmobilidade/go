/* * */

import { AppBannerSchema } from '@/app-configs/app-banner.js';
import { z } from 'zod';

/* * */

export const AppConfigSchema = z.discriminatedUnion('_id', [
	AppBannerSchema,
]);

/* * */

export type AppConfig = z.infer<typeof AppConfigSchema>;
