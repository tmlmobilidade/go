/* * */

import { RoleSchema } from '@tmlmobilidade/go-types-core';
import { normalizeString } from '@tmlmobilidade/strings';
import { z } from 'zod';

/* * */

export const RolesListItemSchema = RoleSchema
	.pick({
		_id: true,
		name: true,
		permissions: true,
	})
	.transform(item => ({
		...item,
		name_normalized: normalizeString(item.name),
	}));

/**
 * The item schema for listing roles.
 * It is intended for use in the roles module.
 */
export type RolesListItem = z.infer<typeof RolesListItemSchema>;
