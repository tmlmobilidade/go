/* * */

import { UserSessionReplayActivationSchema, type UserSessionReplayAuthorization, type UserSessionReplayResponse } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export function isSessionReplayAuthorized(authorization: null | UserSessionReplayAuthorization, now: number): boolean {
	if (authorization?.cancelled_at !== null) return false;

	// Pending expiry stops applying after the first accepted start.
	if (authorization.started_at === null) return authorization.pending_expires_at > now;

	return authorization.expires_at !== null && authorization.expires_at > now;
}

/* * */

/** A null activation tells the client to stop recording. */
export function getSessionReplayResponse(userId: string, authorization: null | UserSessionReplayAuthorization): UserSessionReplayResponse {
	const serverNow = Dates.now('utc').unix_milliseconds;

	return {
		activation: isSessionReplayAuthorized(authorization, serverNow) ? UserSessionReplayActivationSchema.parse(authorization) : null,
		server_now: serverNow,
		user_id: userId,
	};
}
