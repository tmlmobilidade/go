/* * */

import { z } from 'zod';

/* * */

export const AppConfigBannerIdValue = 'app-banner' as const;

export const AppConfigBannerIdSchema = z.literal(AppConfigBannerIdValue);

export type AppConfigBannerId = z.infer<typeof AppConfigBannerIdSchema>;
