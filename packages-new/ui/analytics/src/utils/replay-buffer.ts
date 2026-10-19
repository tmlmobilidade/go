import { type AnalyticsEvent } from '../types/events/shared';
import { type AnalyticsReplayBlock } from '../types/replay/block';
import { type AnalyticsReplayUpload } from '../types/replay/upload';
import { updateReplayBlock } from './replay-block';
import { shouldRetainReplayBlock } from './replay-retention';
import { sendReplayUpload } from './replay-upload';

/* * */

/** One buffer per block also keeps late SDK batches attached to their original decision. */
export function createReplayBuffer(initialBlock: AnalyticsReplayBlock) {
	let block = initialBlock;
	let uploads: AnalyticsReplayUpload[] = [];
	let closed = false;
	let retained = false;
	let closing: Promise<void> | undefined;

	const send = async (request: AnalyticsReplayUpload): Promise<Response> => {
		if (new URL(request.url).searchParams.get('session_id') !== block.id) return new Response(null, { status: 204 });
		if (closed) return retained ? sendReplayUpload(request) : new Response(null, { status: 204 });
		uploads.push({
			...request,
			body: typeof request.body === 'string' ? request.body : request.body.slice(),
			headers: { ...request.headers },
		});
		// Acknowledge local receipt only. Nothing reaches Amplitude before close().
		return new Response(null, { status: 202 });
	};

	const close = (allowRetention = true): Promise<void> => {
		if (closing) return closing;
		closed = true;
		retained = allowRetention && shouldRetainReplayBlock(block);
		const pending = uploads;
		uploads = [];
		closing = (async () => {
			if (!retained) return;
			for (const request of pending) await sendReplayUpload(request);
		})();
		return closing;
	};

	return {
		close,
		recordEvent: (event: AnalyticsEvent) => {
			if (!closed) block = updateReplayBlock(block, event);
		},
		send,
	};
}
