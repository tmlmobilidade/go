/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const ValidationAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
	short_name: true,
});

/**
 * The item schema for listing validation agencies.
 * It is intended for use in the plans module.
 */
export type ValidationAgencyItem = z.infer<typeof ValidationAgencyItemSchema>;
