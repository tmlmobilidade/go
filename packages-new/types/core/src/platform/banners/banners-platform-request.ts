/* * */

import { ModuleIdSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const BannersPlatformRequestSchema = z.object({ module_id: ModuleIdSchema.optional() });
export type BannersPlatformRequest = z.infer<typeof BannersPlatformRequestSchema>;
