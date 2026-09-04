/* * */

import { OrganizationSchema } from '@tmlmobilidade/go-types-core';
import { normalizeString } from '@tmlmobilidade/strings';
import { z } from 'zod';

/* * */

export const OrganizationsListItemSchema = OrganizationSchema
	.pick({
		_id: true,
		long_name: true,
		short_name: true,
	})
	.transform(item => ({
		...item,
		long_name_normalized: normalizeString(item.long_name),
	}));

/**
 * The item schema for listing organizations.
 * It is intended for use in the organizations module.
 */
export type OrganizationsListItem = z.infer<typeof OrganizationsListItemSchema>;
