import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { ContentModuleIdSchema } from '../platform/content-scope.js';
import { BannerSchema } from './banner.js';

/* * */

export const BannersQuerySchema = z.object({ module_id: ContentModuleIdSchema.optional() });
export type BannersQuery = z.infer<typeof BannersQuerySchema>;

export const DismissBannerSchema = z.object({
	dismissal_version: z.number().int().positive(),
	module_id: ContentModuleIdSchema.optional(),
});
export type DismissBannerDto = z.infer<typeof DismissBannerSchema>;

// Reader responses exclude editorial audit and publication controls.
export const BannerReaderSchema = BannerSchema.innerType().pick({
	_id: true, dismissal_version: true, dismissible: true, ends_at: true, kind: true, link: true, message: true, published_at: true, scope: true, severity: true, starts_at: true, title: true,
}).extend({ published_at: UnixMillisecondsSchema });
export type BannerReader = z.infer<typeof BannerReaderSchema>;

export const DismissBannerResultSchema = z.object({ success: z.literal(true) });
export type DismissBannerResult = z.infer<typeof DismissBannerResultSchema>;
