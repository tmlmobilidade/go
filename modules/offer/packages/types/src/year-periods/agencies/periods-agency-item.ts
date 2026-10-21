/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const PeriodsAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
});

/**
 * Agency fields returned by the Periods lookup in the Offer module.
 */
export type PeriodsAgencyItem = z.infer<typeof PeriodsAgencyItemSchema>;
