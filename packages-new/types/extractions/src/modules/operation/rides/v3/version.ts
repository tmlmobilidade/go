/* * */

import { z } from 'zod';

/* * */

export const OperationRidesV3ExtractionVersionValue = 'operation-rides-v3';

export const OperationRidesV3ExtractionVersionSchema = z.literal(OperationRidesV3ExtractionVersionValue);

export type OperationRidesV3ExtractionVersion = z.infer<typeof OperationRidesV3ExtractionVersionSchema>;
