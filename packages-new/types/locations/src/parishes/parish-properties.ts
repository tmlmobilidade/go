/* * */

import { z } from 'zod';

/* * */

export const ParishPropertiesSchema = z.object({
	area_ha: z.number(),
	district_id: z.string(),
	municipality_id: z.string(),
	name: z.string(),
});

/**
 * This type represents the properties of a Parish,
 * both for the geojson feature and the flattened codebase type.
 */
export type ParishProperties = z.infer<typeof ParishPropertiesSchema>;
