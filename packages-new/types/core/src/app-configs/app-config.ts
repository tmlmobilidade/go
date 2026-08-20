/* * */

import { z } from 'zod';

import { AppBannerSchema } from './app-banner.js';

/* * */

export const AppConfigSchema = z.discriminatedUnion('_id', [
	AppBannerSchema,
]);

/* * */

export type AppConfig = z.infer<typeof AppConfigSchema>;
