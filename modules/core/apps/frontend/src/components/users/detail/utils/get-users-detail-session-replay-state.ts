import { type UserSessionReplayAuthorization } from '@tmlmobilidade/go-types-core';

/* * */

export interface UsersDetailSessionReplayState {
	deadline: null | number
	isAuthorized: boolean
	state: 'active' | 'cancelled' | 'completed' | 'expired' | 'none' | 'pending'
}

/** Describes the authorization window, without claiming that an SDK recorder is running. */
export function getUsersDetailSessionReplayState(authorization: null | undefined | UserSessionReplayAuthorization, now: number): UsersDetailSessionReplayState {
	if (!authorization) return { deadline: null, isAuthorized: false, state: 'none' };
	if (authorization.cancelled_at !== null) return { deadline: null, isAuthorized: false, state: 'cancelled' };
	const deadline = authorization.started_at === null ? authorization.pending_expires_at : authorization.expires_at;
	if (deadline === null || deadline <= now) return { deadline: null, isAuthorized: false, state: authorization.started_at === null ? 'expired' : 'completed' };
	return { deadline, isAuthorized: true, state: authorization.started_at === null ? 'pending' : 'active' };
}
