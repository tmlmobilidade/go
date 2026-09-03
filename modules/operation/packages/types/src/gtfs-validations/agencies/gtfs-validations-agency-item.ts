/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const GtfsValidationsAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
	short_name: true,
});

/**
 * The item schema for listing gtfs validations agencies.
 * It is intended for use in the gtfs validations module.
 */
export type GtfsValidationsAgencyItem = z.infer<typeof GtfsValidationsAgencyItemSchema>;
