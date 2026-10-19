import { type AnalyticsReplayUpload } from '../types/replay/upload';

/* * */

/** Buffered requests have left the SDK queue, so retries are owned here. */
export async function sendReplayUpload(request: AnalyticsReplayUpload): Promise<Response> {
	for (let attempt = 0; ; attempt++) {
		let response: Response | undefined;
		let failure: unknown;
		try {
			response = await fetch(request.url, {
				body: typeof request.body === 'string' ? request.body : new Uint8Array(request.body).buffer,
				headers: request.headers,
				keepalive: request.keepalive,
				method: request.method,
			});
		} catch (cause: unknown) {
			failure = cause;
		}
		if (response?.ok) return response;
		if (attempt === 2 || (response && response.status !== 429 && response.status < 500)) {
			throw failure ?? new Error(`Replay upload failed (${response?.status ?? 'network'})`);
		}
		await new Promise<void>((resolve) => { setTimeout(resolve, 500 * (attempt + 1)); });
	}
}
