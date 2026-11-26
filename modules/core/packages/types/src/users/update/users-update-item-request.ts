/* * */

import { UserSchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const UsersUpdateItemRequestSchema = UserSchema.omit({
	_id: true,
	created_at: true,
	created_by: true,
	dismissed_banners: true,
	email_verified: true,
	password_hash: true,
	seen_changelogs: true,
	seen_last_at: true,
	session_ids: true,
	updated_at: true,
	updated_by: true,
	verification_token_ids: true,
});

/**
 * The request schema for updating a user.
 * It is intended for use in the users update endpoint.
 */
export type UsersUpdateItemRequest = z.infer<typeof UsersUpdateItemRequestSchema>;
