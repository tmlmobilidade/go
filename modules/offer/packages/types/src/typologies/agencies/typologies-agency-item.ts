/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const TypologiesAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
});

/**
 * Agency fields returned by the Typologies lookup in the Offer module.
 */
export type TypologiesAgencyItem = z.infer<typeof TypologiesAgencyItemSchema>;
