/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1ExtractionVersionValue = 'operation-posters-v1';

export const OperationPostersV1ExtractionVersionSchema = z.literal(OperationPostersV1ExtractionVersionValue);

export type OperationPostersV1ExtractionVersion = z.infer<typeof OperationPostersV1ExtractionVersionSchema>;
