import { z } from 'zod';

/* * */

export const DatesAnnotationsV1ExtractionVersionValue = 'dates-annotations-v1';
export const DatesAnnotationsV1ExtractionVersionSchema = z.literal(DatesAnnotationsV1ExtractionVersionValue);

export type DatesAnnotationsV1ExtractionVersion = z.infer<typeof DatesAnnotationsV1ExtractionVersionSchema>;
