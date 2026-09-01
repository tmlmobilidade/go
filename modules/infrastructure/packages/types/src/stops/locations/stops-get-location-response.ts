/* * */

import { DistrictSchema, LocalitySchema, MunicipalitySchema, ParishSchema } from '@tmlmobilidade/go-types-locations';
import { z } from 'zod';

/* * */

export const StopsGetLocationResponseSchema = z.object({
	district: DistrictSchema,
	locality: LocalitySchema,
	municipality: MunicipalitySchema,
	parish: ParishSchema,
});

/**
 * The response schema for getting a stop location.
 * It is intended for use in the stops module to filter the locations.
 */
export type StopsGetLocationResponse = z.infer<typeof StopsGetLocationResponseSchema>;
