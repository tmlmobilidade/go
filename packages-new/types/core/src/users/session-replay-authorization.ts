/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

/** One support capture authorization; timestamps and identity are assigned by the backend. */
export const UserSessionReplayAuthorizationSchema = z.object({
	activation_id: z.string().min(1),
	cancelled_at: UnixMillisecondsSchema.nullable().default(null),
	expires_at: UnixMillisecondsSchema.nullable().default(null),
	pending_expires_at: UnixMillisecondsSchema,
	requested_at: UnixMillisecondsSchema,
	requested_by: z.string().min(1),
	started_at: UnixMillisecondsSchema.nullable().default(null),
});

export type UserSessionReplayAuthorization = z.infer<typeof UserSessionReplayAuthorizationSchema>;
