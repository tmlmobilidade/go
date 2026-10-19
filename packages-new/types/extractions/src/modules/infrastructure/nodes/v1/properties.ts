/* * */

import { z } from 'zod';

import { InfrastructureStopsExtractionFiltersSchema } from '../../filters.js';

/* * */

export const InfrastructureNodesV1ExtractionPropertiesSchema = InfrastructureStopsExtractionFiltersSchema;

export type InfrastructureNodesV1ExtractionProperties = z.infer<typeof InfrastructureNodesV1ExtractionPropertiesSchema>;
