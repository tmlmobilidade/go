import { OperationalBannerSchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const OperationalBannerListItemSchema = OperationalBannerSchema.innerType().pick({
	_id: true,
	dismissal_version: true,
	dismissible: true,
	ends_at: true,
	kind: true,
	message: true,
	published_at: true,
	scope: true,
	severity: true,
	starts_at: true,
	status: true,
	title: true,
	updated_at: true,
});
export type OperationalBannerListItem = z.infer<typeof OperationalBannerListItemSchema>;

export const BannerManagementQuerySchema = z.object({
	status: z.enum(['draft', 'published', 'archived']).optional(),
});
export type BannerManagementQuery = z.infer<typeof BannerManagementQuerySchema>;
