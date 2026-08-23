/* * */

import { RoleSchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const UsersRoleItemSchema = RoleSchema.pick({
	_id: true,
	name: true,
});

/**
 * The item schema for listing users roles.
 * It is intended for use in the users module.
 */
export type UsersRoleItem = z.infer<typeof UsersRoleItemSchema>;
