/* * */

import { OrganizationSchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const UsersOrganizationItemSchema = OrganizationSchema.pick({
	_id: true,
	long_name: true,
	short_name: true,
});

/**
 * The item schema for listing users organizations.
 * It is intended for use in the users module.
 */
export type UsersOrganizationItem = z.infer<typeof UsersOrganizationItemSchema>;
