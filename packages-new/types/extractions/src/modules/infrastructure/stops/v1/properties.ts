/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const InfrastructureStopsV1ExtractionPropertiesSchema = z.object({
	agency_ids: z.array(z.string()).optional(),
	connections: StopSchema.shape.connections.optional(),
	facilities: StopSchema.shape.facilities.optional(),
	lifecycle_statuses: z.array(LifecycleStatusSchema).optional(),
	location_neighbourhood_ids: z.array(z.string()).optional(),
	location_primary_ids: z.array(z.string()).optional(),
	location_secondary_ids: z.array(z.string()).optional(),
	location_tertiary_ids: z.array(z.string()).optional(),
});

export type InfrastructureStopsV1ExtractionProperties = z.infer<typeof InfrastructureStopsV1ExtractionPropertiesSchema>;
