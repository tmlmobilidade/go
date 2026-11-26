/* * */

import { UserSchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const UsersDetailItemResponseSchema = UserSchema.omit({
	password_hash: true,
	session_ids: true,
	verification_token_ids: true,
});

/**
 * The response schema for disclosing a user's details.
 * It is intended for use in the users detail endpoint.
 */
export type UsersDetailItemResponse = z.infer<typeof UsersDetailItemResponseSchema>;
