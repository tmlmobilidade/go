/* * */

import { z } from 'zod';

/* * */

export const OperationRidesV1ExtractionVersionValue = 'operation-rides-v1';

export const OperationRidesV1ExtractionVersionSchema = z.literal(OperationRidesV1ExtractionVersionValue);

export type OperationRidesV1ExtractionVersion = z.infer<typeof OperationRidesV1ExtractionVersionSchema>;
