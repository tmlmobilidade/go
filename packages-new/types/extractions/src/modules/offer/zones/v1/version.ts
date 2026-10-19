/* * */

import { z } from 'zod';

/* * */

export const OfferZonesV1ExtractionVersionValue = 'offer-zones-v1';

export const OfferZonesV1ExtractionVersionSchema = z.literal(OfferZonesV1ExtractionVersionValue);

export type OfferZonesV1ExtractionVersion = z.infer<typeof OfferZonesV1ExtractionVersionSchema>;
