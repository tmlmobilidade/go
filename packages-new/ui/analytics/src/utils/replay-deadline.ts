/** Persists one deadline per project, user and activation across reloads on the same origin. */
export function getReplayDeadline(apiKey: string, userId: string, activationId: string, durationMs: number): number {
	const key = `go:session-replay:${JSON.stringify([apiKey, userId, activationId])}`;
	const stored = window.localStorage.getItem(key);
	if (stored !== null) {
		const deadline = Number(stored);
		if (!Number.isSafeInteger(deadline) || deadline <= 0) throw new Error('Invalid persisted session replay deadline.');
		return deadline;
	}

	const deadline = Date.now() + durationMs;
	// If storage is unavailable, let the caller refuse capture instead of granting a new window on reload.
	window.localStorage.setItem(key, String(deadline));
	return deadline;
}
