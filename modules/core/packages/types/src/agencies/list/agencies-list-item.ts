/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { normalizeString } from '@tmlmobilidade/strings';
import { z } from 'zod';

/* * */

export const AgenciesListItemSchema = AgencySchema
	.pick({
		_id: true,
		code: true,
		name: true,
		pta_name: true,
		short_name: true,
	})
	.transform(item => ({
		...item,
		name_normalized: normalizeString(item.name),
	}));

/**
 * The item schema for listing agencies.
 * It is intended for use in the agencies module.
 */
export type AgenciesListItem = z.infer<typeof AgenciesListItemSchema>;
