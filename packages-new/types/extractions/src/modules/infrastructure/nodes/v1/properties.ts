/* * */

import { LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const InfrastructureNodesV1ExtractionPropertiesSchema = z.object({
	agency_ids: z.array(z.string()).min(1),
	/** Search centre in GeoJSON order [longitude, latitude], with a fixed 100 m radius. */
	coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]).optional(),
	lifecycle_statuses: z.array(LifecycleStatusSchema).min(1),
	location_neighbourhood_ids: z.array(z.string()).optional(),
	location_primary_ids: z.array(z.string()).optional(),
	location_secondary_ids: z.array(z.string()).optional(),
	location_tertiary_ids: z.array(z.string()).optional(),
});

export type InfrastructureNodesV1ExtractionProperties = z.infer<typeof InfrastructureNodesV1ExtractionPropertiesSchema>;
