import { type UserSessionReplayAuthorization } from '@tmlmobilidade/go-types-core';

/* * */

export interface UsersDetailSessionReplayState {
	deadline: null | number
	isAuthorized: boolean
	state: 'active' | 'inactive' | 'pending'
}

/** States describe authorization; they do not confirm that the SDK is recording. */
export function getUsersDetailSessionReplayState(authorization: null | undefined | UserSessionReplayAuthorization, now: number): UsersDetailSessionReplayState {
	if (authorization?.cancelled_at !== null) return { deadline: null, isAuthorized: false, state: 'inactive' };

	const deadline = authorization.started_at === null ? authorization.pending_expires_at : authorization.expires_at;

	if (deadline === null || deadline <= now) return { deadline: null, isAuthorized: false, state: 'inactive' };

	return { deadline, isAuthorized: true, state: authorization.started_at === null ? 'pending' : 'active' };
}
