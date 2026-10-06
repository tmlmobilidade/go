/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const InfrastructureStopsExtractionFiltersSchema = z.object({
	agency_ids: z.array(z.string()).optional(),
	connections: StopSchema.shape.connections.optional(),
	facilities: StopSchema.shape.facilities.optional(),
	lifecycle_statuses: z.array(LifecycleStatusSchema).optional(),
	location_neighbourhood_ids: z.array(z.string()).optional(),
	location_primary_ids: z.array(z.string()).optional(),
	location_secondary_ids: z.array(z.string()).optional(),
	location_tertiary_ids: z.array(z.string()).optional(),
	// Retained for extractions created before administrative slot filters.
	municipality_ids: z.array(z.string()).optional(),
	search: z.string().trim().optional(),
});

export type InfrastructureStopsExtractionFilters = z.infer<typeof InfrastructureStopsExtractionFiltersSchema>;
