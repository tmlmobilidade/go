/* * */

import { z } from 'zod';

import { ChangelogSchema } from '../../changelogs/changelog.js';

/* * */

export const ChangelogPlatformResponseSchema = ChangelogSchema.pick({
	_id: true, items: true, scope: true, summary: true, title: true,
}).extend({ is_seen: z.boolean() });
export type ChangelogPlatformResponse = z.infer<typeof ChangelogPlatformResponseSchema>;
