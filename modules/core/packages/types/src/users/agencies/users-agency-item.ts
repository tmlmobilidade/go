/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const UsersAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
});

/**
 * The item schema for listing users agencies.
 * It is intended for use in the users module.
 */
export type UsersAgencyItem = z.infer<typeof UsersAgencyItemSchema>;
