/* * */

import { UserSessionReplayActivationSchema, type UserSessionReplayAuthorization, type UserSessionReplayResponse } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

/** Pending expiry applies only before the first accepted start. */
export function isSessionReplayAuthorized(authorization: UserSessionReplayAuthorization | null, now: number): boolean {
	if (!authorization || authorization.cancelled_at !== null) return false;
	if (authorization.started_at === null) return authorization.pending_expires_at > now;
	return authorization.expires_at !== null && authorization.expires_at > now;
}

/** A null activation tells the client to stop without exposing the operator's identity. */
export function getSessionReplayResponse(userId: string, authorization: UserSessionReplayAuthorization | null): UserSessionReplayResponse {
	const serverNow = Dates.now('utc').unix_milliseconds;
	return {
		activation: isSessionReplayAuthorized(authorization, serverNow) ? UserSessionReplayActivationSchema.parse(authorization) : null,
		server_now: serverNow,
		user_id: userId,
	};
}
