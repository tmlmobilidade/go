/* * */

import { z } from 'zod';

/* * */

export const OperationGtfsSteppV1ExtractionVersionValue = 'operation-gtfs-stepp-v1';

export const OperationGtfsSteppV1ExtractionVersionSchema = z.literal(OperationGtfsSteppV1ExtractionVersionValue);

export type OperationGtfsSteppV1ExtractionVersion = z.infer<typeof OperationGtfsSteppV1ExtractionVersionSchema>;
