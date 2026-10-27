import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

/** One acknowledgement per user/release, preserving the first seen timestamp. */
export const ChangelogViewSchema = z.object({
	_id: z.string().min(1),
	release_id: z.string().min(1),
	seen_at: UnixMillisecondsSchema,
	user_id: z.string().min(1),
});

export type ChangelogView = z.infer<typeof ChangelogViewSchema>;
