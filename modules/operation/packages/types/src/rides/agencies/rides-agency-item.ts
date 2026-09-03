/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const RidesAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
	short_name: true,
});

/**
 * The item schema for listing rides agencies.
 * It is intended for use in the rides module.
 */
export type RidesAgencyItem = z.infer<typeof RidesAgencyItemSchema>;
