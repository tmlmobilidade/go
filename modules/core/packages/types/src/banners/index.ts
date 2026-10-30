import { BannerSchema } from '@tmlmobilidade/go-types-core';
import { PublishStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const BannerListItemSchema = BannerSchema.innerType().pick({
	_id: true,
	dismissal_version: true,
	dismissible: true,
	ends_at: true,
	kind: true,
	message: true,
	publish_status: true,
	scope: true,
	severity: true,
	starts_at: true,
	title: true,
	updated_at: true,
});
export type BannerListItem = z.infer<typeof BannerListItemSchema>;

export const BannerManagementQuerySchema = z.object({
	publish_status: PublishStatusSchema.optional(),
});
export type BannerManagementQuery = z.infer<typeof BannerManagementQuerySchema>;
