/* * */

import { z } from 'zod';

/* * */

export const OperationAlertsV1ExtractionVersionValue = 'operation-alerts-v1';

export const OperationAlertsV1ExtractionVersionSchema = z.literal(OperationAlertsV1ExtractionVersionValue);

export type OperationAlertsV1ExtractionVersion = z.infer<typeof OperationAlertsV1ExtractionVersionSchema>;
