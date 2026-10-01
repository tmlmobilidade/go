/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const RolesAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
});

/**
 * The item schema for listing roles agencies.
 * It is intended for use in the roles module.
 */
export type RolesAgencyItem = z.infer<typeof RolesAgencyItemSchema>;
