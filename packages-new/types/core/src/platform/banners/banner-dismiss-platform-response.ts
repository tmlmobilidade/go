/* * */

import { z } from 'zod';

/* * */

export const BannerDismissPlatformResponseSchema = z.object({ success: z.literal(true) });
export type BannerDismissPlatformResponse = z.infer<typeof BannerDismissPlatformResponseSchema>;
