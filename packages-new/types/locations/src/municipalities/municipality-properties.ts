/* * */

import { z } from 'zod';

/* * */

export const MunicipalityPropertiesSchema = z.object({
	area_ha: z.number(),
	district_id: z.string(),
	name: z.string(),
});

/**
 * This type represents the properties of a Municipality,
 * both for the geojson feature and the flattened codebase type.
 */
export type MunicipalityProperties = z.infer<typeof MunicipalityPropertiesSchema>;
