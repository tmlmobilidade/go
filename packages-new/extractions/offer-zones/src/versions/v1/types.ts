/* * */

import { ZoneSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

/* * */

/** Invalid or missing field values leave their CSV cell empty without discarding the zone. */
export const OfferZonesV1OutputRowSchema = z.object({
	_id: ZoneSchema.shape._id.catch(''),
	agency_ids: z.string().catch(''),
	code: ZoneSchema.shape.code.catch(''),
	name: ZoneSchema.shape.name.catch(''),
});

export type OfferZonesV1OutputRowInput = Partial<z.input<typeof OfferZonesV1OutputRowSchema>>;
export type OfferZonesV1OutputRow = z.infer<typeof OfferZonesV1OutputRowSchema>;
