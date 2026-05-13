/* * */

import { SystemStatusSchema } from '@/_common/system-status.js';
import { UnixTimestampSchema } from '@/_common/unix-timestamp.js';
import { PermissionCatalog } from '@/permissions/index.js';
import { z } from 'zod';

/* * */

/** When absent or empty in the querystring → use {@link PermissionCatalog.ALLOW_ALL_FLAG} via schema default (no agency restriction). */
function preprocessAgencyIdsParam(val: unknown): string[] | undefined {
	return preprocessStringArrayParam(val);
}

/** Parses querystring arrays that may come as CSV strings or repeated params. */
function preprocessStringArrayParam(val: unknown): string[] | undefined {
	if (val === undefined || val === null || val === '')
		return undefined;
	if (Array.isArray(val)) {
		const values = val
			.flatMap(v => String(v).split(','))
			.map(s => s.trim())
			.filter(Boolean);
		return values.length ? values : undefined;
	}
	if (typeof val === 'string') {
		const values = val
			.split(',')
			.map(value => value.trim())
			.filter(Boolean);
		return values.length ? values : undefined;
	}
	return undefined;
}

/* * */

export const GetSamsBatchQuerySchema = z.object({

	agency_ids: z
		.preprocess(preprocessAgencyIdsParam, z.array(z.string()).optional())
		.default([PermissionCatalog.ALLOW_ALL_FLAG]),

	latest_apex_version: z
		.preprocess(preprocessStringArrayParam, z.array(z.string()).optional()),

	search: z
		.string()
		.optional(),

	seen_first_at: UnixTimestampSchema.optional(),

	seen_last_at: UnixTimestampSchema.optional(),
	system_status: z
		.preprocess(preprocessStringArrayParam, z.array(SystemStatusSchema).optional()),

});

/* * */

export type GetSamsBatchQuery = z.infer<typeof GetSamsBatchQuerySchema>;
