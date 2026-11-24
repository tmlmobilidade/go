/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const UserChangelogSeenSchema = z.object({
	changelog_id: z.string().min(1),
	seen_at: UnixMillisecondsSchema,
});

export type UserChangelogSeen = z.infer<typeof UserChangelogSeenSchema>;
