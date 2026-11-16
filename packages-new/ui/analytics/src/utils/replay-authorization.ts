import { type UserSessionReplayResponse, UserSessionReplayResponseSchema } from '@tmlmobilidade/go-types-core';

import { type AnalyticsReplayActivation } from '../types/replay/activation';

/* * */

interface RequestReplayAuthorizationReturnType {
	monotonicRequestedAt: number
	requestedAt: number
	value: UserSessionReplayResponse
}

/* * */

async function requestReplayAuthorization(url: string, userId: string, signal: AbortSignal, activationId?: string): Promise<RequestReplayAuthorizationReturnType> {
	const requestedAt = Date.now();
	const monotonicRequestedAt = performance.now();

	const response = await fetch(activationId ? `${url.replace(/\/$/, '')}/start` : url, {
		body: activationId ? JSON.stringify({ activation_id: activationId }) : undefined,
		cache: 'no-store',
		credentials: 'include',
		headers: activationId ? { 'Content-Type': 'application/json' } : undefined,
		method: activationId ? 'POST' : 'GET',
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

export async function fetchReplayActivation(url: string, userId: string, signal: AbortSignal): Promise<AnalyticsReplayActivation | undefined> {
	//
	// Load authorization

	let response = await requestReplayAuthorization(url, userId, signal);

	if (signal.aborted) return undefined;

	// The backend starts each activation once and preserves its deadline on reload.
	const pending = response.value.activation;

	if (pending?.started_at === null) {
		response = await requestReplayAuthorization(url, userId, signal, pending.activation_id);
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
