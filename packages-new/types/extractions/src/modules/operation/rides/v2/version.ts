/* * */

import { z } from 'zod';

/* * */

export const OperationRidesV2ExtractionVersionValue = 'operation-rides-v2';

export const OperationRidesV2ExtractionVersionSchema = z.literal(OperationRidesV2ExtractionVersionValue);

export type OperationRidesV2ExtractionVersion = z.infer<typeof OperationRidesV2ExtractionVersionSchema>;
