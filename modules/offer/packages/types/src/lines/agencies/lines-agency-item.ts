/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const LinesAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	financials: true,
	name: true,
	short_name: true,
});

/**
 * The item schema for listing permitted line agencies.
 * It is intended for use in the Offer module.
 */
export type LinesAgencyItem = z.infer<typeof LinesAgencyItemSchema>;
