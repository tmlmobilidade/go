/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const FaresAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
	short_name: true,
});

/**
 * Agency fields returned by the Fares lookup in the Offer module.
 */
export type FaresAgencyItem = z.infer<typeof FaresAgencyItemSchema>;
