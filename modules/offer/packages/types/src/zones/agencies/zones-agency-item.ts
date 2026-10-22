/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const ZonesAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
	short_name: true,
});

/**
 * Agency fields returned by the Zones lookup in the Offer module.
 */
export type ZonesAgencyItem = z.infer<typeof ZonesAgencyItemSchema>;
