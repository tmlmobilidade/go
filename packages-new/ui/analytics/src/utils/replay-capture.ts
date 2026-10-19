import { type Types } from '@amplitude/analytics-browser';
import { type SessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

import { type AnalyticsEvent } from '../types/events/shared';
import { type AnalyticsReplayBlock } from '../types/replay/block';
import { createReplayBuffer } from './replay-buffer';

/* * */

/** Owns the SDK recorder and upload buffer for one independent replay block. */
export function createReplayCapture(client: Types.BrowserClient, block: AnalyticsReplayBlock, onError: (cause: unknown) => void) {
	const buffer = createReplayBuffer(block);
	let plugin: SessionReplayPlugin | undefined;
	let paused = false;

	const pause = () => {
		paused = true;
		plugin?.stop();
	};

	return {
		finish: async (allowRetention: boolean) => {
			pause();
			try {
				if (plugin) await client.remove(plugin.name).promise;
			} finally {
				// Uploads may finish after the next block starts; each buffer keeps its own policy.
				void buffer.close(allowRetention && !client.getOptOut()).catch(onError);
			}
		},
		pause,
		recordEvent: (event: AnalyticsEvent) => {
			if (!paused) buffer.recordEvent(event);
		},
		start: async (): Promise<boolean> => {
			const { sessionReplayPlugin } = await import('@amplitude/plugin-session-replay-browser');
			if (paused || client.getOptOut()) return false;
			plugin = sessionReplayPlugin({
				customSessionId: () => block.id,
				handleSendEvents: buffer.send,
				sampleRate: 1,
				storeType: 'memory',
			});
			await client.add(plugin).promise;
			if (!paused && !client.getOptOut()) {
				// A replay-only ID starts a fresh DOM snapshot without splitting Analytics sessions.
				await plugin.sessionReplay.setSessionId(block.id).promise;
			}
			if (paused || client.getOptOut()) {
				plugin.stop();
				return false;
			}
			return true;
		},
	};
}
