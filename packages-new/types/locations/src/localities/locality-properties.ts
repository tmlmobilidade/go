/* * */

import { z } from 'zod';

/* * */

export const LocalityPropertiesSchema = z.object({
	area_ha: z.number(),
	district_id: z.string(),
	municipality_id: z.string(),
	name: z.string(),
});

/**
 * This type represents the properties of a Locality,
 * both for the geojson feature and the flattened codebase type.
 */
export type LocalityProperties = z.infer<typeof LocalityPropertiesSchema>;
