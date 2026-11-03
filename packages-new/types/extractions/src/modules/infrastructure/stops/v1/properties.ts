/* * */

import { StopConnectionSchema, StopFacilitySchema } from '@tmlmobilidade/go-types-infrastructure';
import { LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const InfrastructureStopsV1ExtractionPropertiesSchema = z.object({
	agency_ids: z.array(z.string()).min(1),
	connections: StopConnectionSchema.optional(),
	facilities: StopFacilitySchema.optional(),
	lifecycle_statuses: z.array(LifecycleStatusSchema).min(1),
	location_neighbourhood_ids: z.array(z.string()).optional(),
	location_primary_ids: z.array(z.string()).optional(),
	location_secondary_ids: z.array(z.string()).optional(),
	location_tertiary_ids: z.array(z.string()).optional(),
});

export type InfrastructureStopsV1ExtractionProperties = z.infer<typeof InfrastructureStopsV1ExtractionPropertiesSchema>;
