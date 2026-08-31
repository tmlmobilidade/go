/* * */

import { MunicipalitySchema } from '@tmlmobilidade/go-types-locations';
import { z } from 'zod';

/* * */

export const StopsMunicipalityItemSchema = MunicipalitySchema.pick({
	_id: true,
	code: true,
	name: true,
	short_name: true,
});

/**
 * The item schema for listing plans agencies.
 * It is intended for use in the plans module.
 */
export type StopsMunicipalityItem = z.infer<typeof StopsMunicipalityItemSchema>;
