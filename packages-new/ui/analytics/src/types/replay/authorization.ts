import { type UserSessionReplayAuthorization, type UserSessionReplayResponse } from '@tmlmobilidade/go-types-core';

/* * */

/** Authorization from /me, anchored to the start of that request. */
export interface AnalyticsReplayAuthorization {
	authorization: null | UserSessionReplayAuthorization
	monotonicRequestedAt: number
	requestedAt: number
	serverNow: UserSessionReplayResponse['server_now']
	userId: string
}
