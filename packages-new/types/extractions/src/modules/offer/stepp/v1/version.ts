/* * */

import { z } from 'zod';

/* * */

export const OfferGtfsSteppV1ExtractionVersionValue = 'offer-stepp-v1';

export const OfferGtfsSteppV1ExtractionVersionSchema = z.literal(OfferGtfsSteppV1ExtractionVersionValue);

export type OfferGtfsSteppV1ExtractionVersion = z.infer<typeof OfferGtfsSteppV1ExtractionVersionSchema>;
