/* * */

import { DistrictSchema, LocalitySchema, MunicipalitySchema, ParishSchema } from '@tmlmobilidade/go-types-locations';
import { z } from 'zod';

/* * */

export const StopsLocationResponseSchema = z.object({
	districts: z.array(DistrictSchema),
	localities: z.array(LocalitySchema),
	municipalities: z.array(MunicipalitySchema),
	parishes: z.array(ParishSchema),
});

/**
 * The response schema for listing stops locations.
 * It is intended for use in the stops module to filter the locations.
 */
export type StopsLocationResponse = z.infer<typeof StopsLocationResponseSchema>;
