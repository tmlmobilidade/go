/* * */

import { PermissionCatalog } from '@/permissions/index.js';
import { z } from 'zod';

/* * */

/** When absent or empty in the querystring → use {@link PermissionCatalog.ALLOW_ALL_FLAG} via schema default (no agency restriction). */
function preprocessAgencyIdsParam(val: unknown): string[] | undefined {
	if (val === undefined || val === null || val === '')
		return undefined;
	if (Array.isArray(val)) {
		const ids = val
			.flatMap(v => String(v).split(','))
			.map(s => s.trim())
			.filter(Boolean);
		return ids.length ? ids : undefined;
	}
	if (typeof val === 'string') {
		const ids = val
			.split(',')
			.map(id => id.trim())
			.filter(Boolean);
		return ids.length ? ids : undefined;
	}
	return undefined;
}

/* * */

export const GetSamsBatchQuerySchema = z.object({

	agency_ids: z
		.preprocess(preprocessAgencyIdsParam, z.array(z.string()).optional())
		.default([PermissionCatalog.ALLOW_ALL_FLAG]),

	search: z
		.string()
		.optional(),

});

/* * */

export type GetSamsBatchQuery = z.infer<typeof GetSamsBatchQuerySchema>;
