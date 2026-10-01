/* * */

import { z } from 'zod';

/* * */

export const InfrastructureStopsV1ExtractionVersionValue = 'infrastructure-stops-v1';

export const InfrastructureStopsV1ExtractionVersionSchema = z.literal(InfrastructureStopsV1ExtractionVersionValue);

export type InfrastructureStopsV1ExtractionVersion = z.infer<typeof InfrastructureStopsV1ExtractionVersionSchema>;
