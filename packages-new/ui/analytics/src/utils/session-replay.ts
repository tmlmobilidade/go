import { UserSessionReplayResponseSchema } from '@tmlmobilidade/go-types-core';

/* * */

interface SessionReplayDeadline {
	deadline: number
	monotonicDeadline: number
}

/* * */

export async function startSessionReplay(url: string, userId: string, activationId: string, signal: AbortSignal): Promise<SessionReplayDeadline> {
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

	if (!response.ok) throw new Error(`Unable to start session replay (${response.status})`);
	const result = await response.json() as { data?: unknown, error?: null | string };
	if (result.error) throw new Error(result.error);

	const { activation, server_now: serverNow, user_id: responseUserId } = UserSessionReplayResponseSchema.parse(result.data);
	if (
		signal.aborted
		|| responseUserId !== userId
		|| activation?.activation_id !== activationId
		|| activation.started_at === null
		|| activation.expires_at === null
	) throw new Error('Session replay authorization is no longer valid');

	const remaining = activation.expires_at - serverNow;

	// Request time and either clock advancing can shorten, but never extend, capture.
	return { deadline: requestedAt + remaining, monotonicDeadline: monotonicRequestedAt + remaining };
}

/* * */

export function getReplayTimeRemaining({ deadline, monotonicDeadline }: SessionReplayDeadline): number {
	return Math.max(0, Math.min(deadline - Date.now(), monotonicDeadline - performance.now()));
}
