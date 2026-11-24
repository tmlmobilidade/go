/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const VehiclesAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
	short_name: true,
});

/**
 * The item schema for listing vehicles agencies.
 * It is intended for use in the vehicles module.
 */
export type VehiclesAgencyItem = z.infer<typeof VehiclesAgencyItemSchema>;
