import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { ContentModuleIdSchema } from '../platform/content-scope.js';
import { OperationalBannerSchema } from './banner.js';

/* * */

export const OperationalBannersQuerySchema = z.object({ module_id: ContentModuleIdSchema.optional() });
export type OperationalBannersQuery = z.infer<typeof OperationalBannersQuerySchema>;

export const DismissOperationalBannerSchema = z.object({
	dismissal_version: z.number().int().positive(),
	module_id: ContentModuleIdSchema.optional(),
});
export type DismissOperationalBannerDto = z.infer<typeof DismissOperationalBannerSchema>;

// Reader responses exclude editorial audit and publication controls.
export const OperationalBannerReaderSchema = OperationalBannerSchema.innerType().pick({
	_id: true, dismissal_version: true, dismissible: true, ends_at: true, kind: true, link: true, message: true, published_at: true, scope: true, severity: true, starts_at: true, title: true,
}).extend({ published_at: UnixMillisecondsSchema });
export type OperationalBannerReader = z.infer<typeof OperationalBannerReaderSchema>;

export const DismissOperationalBannerResultSchema = z.object({ success: z.literal(true) });
export type DismissOperationalBannerResult = z.infer<typeof DismissOperationalBannerResultSchema>;
