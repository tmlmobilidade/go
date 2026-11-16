import { type UserSessionReplayResponse, UserSessionReplayResponseSchema } from '@tmlmobilidade/go-types-core';

import { type AnalyticsReplayActivation } from '../types/replay/activation';
import { type AnalyticsReplayAuthorization } from '../types/replay/authorization';

/* * */

interface RequestReplayAuthorizationReturnType {
	monotonicRequestedAt: number
	requestedAt: number
	value: UserSessionReplayResponse
}

/* * */

async function requestReplayStart(url: string, userId: string, signal: AbortSignal, activationId: string): Promise<RequestReplayAuthorizationReturnType> {
	const requestedAt = Date.now();
	const monotonicRequestedAt = performance.now();

	const response = await fetch(url, {
		body: JSON.stringify({ activation_id: activationId }),
		cache: 'no-store',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
		signal,
	});

	if (!response.ok) throw new Error(`Unable to load replay authorization (${response.status})`);

	const result = await response.json() as { data?: unknown, error?: null | string };

	if (result.error) throw new Error(result.error);

	const value = UserSessionReplayResponseSchema.parse(result.data);

	// Reject responses from a replaced login session.
	if (value.user_id !== userId) throw new Error('Replay authorization belongs to a different session user');

	return { monotonicRequestedAt, requestedAt, value };
}

/* * */

export async function fetchReplayActivation(authorization: AnalyticsReplayAuthorization, startUrl: string, signal: AbortSignal): Promise<AnalyticsReplayActivation | undefined> {
	//
	// Check authorization from /me

	const current = authorization.authorization;

	if (signal.aborted || current?.cancelled_at !== null) return undefined;

	const authorizationExpiry = current.started_at === null ? current.pending_expires_at : current.expires_at;

	if (authorizationExpiry === null) return undefined;

	const authorizationRemaining = authorizationExpiry - authorization.serverNow;

	if (
		authorization.requestedAt + authorizationRemaining <= Date.now()
		|| authorization.monotonicRequestedAt + authorizationRemaining <= performance.now()
	) return undefined;

	let response: RequestReplayAuthorizationReturnType = {
		monotonicRequestedAt: authorization.monotonicRequestedAt,
		requestedAt: authorization.requestedAt,
		value: { activation: current, server_now: authorization.serverNow, user_id: authorization.userId },
	};

	// The backend starts each activation once and preserves its deadline on reload.
	if (current.started_at === null) {
		response = await requestReplayStart(startUrl, authorization.userId, signal, current.activation_id);
	}

	const { activation, server_now: serverNow } = response.value;

	if (signal.aborted || activation?.started_at == null || activation.expires_at === null) return undefined;

	//
	// Calculate local deadlines

	const remaining = activation.expires_at - serverNow;

	// Anchor deadlines to request start so network time cannot extend the window.
	const deadline = response.requestedAt + remaining;
	const monotonicDeadline = response.monotonicRequestedAt + remaining;

	if (deadline <= Date.now() || monotonicDeadline <= performance.now()) return undefined;

	return { activationId: activation.activation_id, deadline, expiresAt: activation.expires_at, monotonicDeadline };
}

/* * */

/** Both clocks limit capture so clock changes cannot extend the window. */
export function getReplayTimeRemaining(activation: AnalyticsReplayActivation): number {
	return Math.max(0, Math.min(activation.deadline - Date.now(), activation.monotonicDeadline - performance.now()));
}
