/* * */

import { z } from 'zod';

/* * */

export const OfferZonesGeopackageV1ExtractionVersionValue = 'offer-zones-geopackage-v1';

export const OfferZonesGeopackageV1ExtractionVersionSchema = z.literal(OfferZonesGeopackageV1ExtractionVersionValue);

export type OfferZonesGeopackageV1ExtractionVersion = z.infer<typeof OfferZonesGeopackageV1ExtractionVersionSchema>;
