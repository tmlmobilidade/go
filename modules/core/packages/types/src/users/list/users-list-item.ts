/* * */

import { UserSchema } from '@tmlmobilidade/go-types-core';
import { normalizeString } from '@tmlmobilidade/strings';
import { z } from 'zod';

/* * */

export const UsersListItemSchema = UserSchema
	.pick({
		_id: true,
		email: true,
		first_name: true,
		last_name: true,
		organization_id: true,
		role_ids: true,
		seen_last_at: true,
	})
	.transform(item => ({
		...item,
		first_name_normalized: normalizeString(item.first_name),
		full_name: `${item.first_name} ${item.last_name}`,
		full_name_normalized: normalizeString(`${item.first_name} ${item.last_name}`),
		last_name_normalized: normalizeString(item.last_name),
	}));

/**
 * The item schema for listing users.
 * It is intended for use in the users module.
 */
export type UsersListItem = z.infer<typeof UsersListItemSchema>;
