/* * */

import { UserSchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const UsersCreateItemRequestSchema = UserSchema.pick({
	email: true,
	first_name: true,
	last_name: true,
	organization_id: true,
	role_ids: true,
});

/**
 * The request schema for creating a user.
 * It is intended for use in the users create endpoint.
 */
export type UsersCreateItemRequest = z.infer<typeof UsersCreateItemRequestSchema>;
