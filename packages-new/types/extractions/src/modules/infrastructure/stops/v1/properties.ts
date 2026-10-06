/* * */

import { z } from 'zod';

import { InfrastructureStopsExtractionFiltersSchema } from '../../filters.js';

/* * */

export const InfrastructureStopsV1ExtractionPropertiesSchema = InfrastructureStopsExtractionFiltersSchema;

export type InfrastructureStopsV1ExtractionProperties = z.infer<typeof InfrastructureStopsV1ExtractionPropertiesSchema>;
