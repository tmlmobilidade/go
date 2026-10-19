/* * */

import { z } from 'zod';

import { AppConfigBannerSchema } from './banner/banner.js';

/* * */

export const AppConfigSchema = z.discriminatedUnion('_id', [
	AppConfigBannerSchema,
]);

/* * */

export type AppConfig = z.infer<typeof AppConfigSchema>;
