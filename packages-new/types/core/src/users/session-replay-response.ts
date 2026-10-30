/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { UserSessionReplayAuthorizationSchema } from './session-replay-authorization.js';

/* * */

/** Only the activation and its server-owned deadlines are needed by the recorder. */
export const UserSessionReplayActivationSchema = UserSessionReplayAuthorizationSchema.pick({
	activation_id: true,
	expires_at: true,
	pending_expires_at: true,
	started_at: true,
});

export const UserSessionReplayResponseSchema = z.object({
	activation: UserSessionReplayActivationSchema.nullable(),
	server_now: UnixMillisecondsSchema,
	user_id: z.string().min(1),
});

export type UserSessionReplayResponse = z.infer<typeof UserSessionReplayResponseSchema>;
