/* * */

import { z } from 'zod';

/* * */

export const OfferSteppV1ExtractionVersionValue = 'offer-stepp-v1';

export const OfferSteppV1ExtractionVersionSchema = z.literal(OfferSteppV1ExtractionVersionValue);

export type OfferSteppV1ExtractionVersion = z.infer<typeof OfferSteppV1ExtractionVersionSchema>;
