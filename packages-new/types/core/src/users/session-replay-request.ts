/* * */

import { z } from 'zod';

import { UserSessionReplayAuthorizationSchema } from './session-replay-authorization.js';

/* * */

/** Starting a capture never accepts a user ID or a client-defined deadline. */
export const UserSessionReplayStartRequestSchema = UserSessionReplayAuthorizationSchema.pick({ activation_id: true }).strict();

export type UserSessionReplayStartRequest = z.infer<typeof UserSessionReplayStartRequestSchema>;
