/* * */

import { z } from 'zod';

/* * */

export const OfferGtfsV29ExtractionVersionValue = 'offer-gtfs-v29';

export const OfferGtfsV29ExtractionVersionSchema = z.literal(OfferGtfsV29ExtractionVersionValue);

export type OfferGtfsV29ExtractionVersion = z.infer<typeof OfferGtfsV29ExtractionVersionSchema>;
