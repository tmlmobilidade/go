/* * */

import { z } from 'zod';

/* * */

export const DistrictPropertiesSchema = z.object({
	area_ha: z.number(),
	name: z.string(),
});

/**
 * This type represents the properties of a District,
 * both for the geojson feature and the flattened codebase type.
 */
export type DistrictProperties = z.infer<typeof DistrictPropertiesSchema>;
