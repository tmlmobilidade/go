/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const HolidaysAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
});

/**
 * Agency fields returned by the Holidays lookup in the Dates module.
 */
export type HolidaysAgencyItem = z.infer<typeof HolidaysAgencyItemSchema>;
