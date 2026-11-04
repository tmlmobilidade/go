import { type Types } from '@amplitude/analytics-browser';
import { type SessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

/* * */

/** Owns one SDK recorder; storage and uploads are managed by Amplitude. */
export function createReplayCapture(client: Types.BrowserClient) {
	let plugin: SessionReplayPlugin | undefined;
	let paused = false;

	const pause = () => {
		paused = true;
		plugin?.stop();
	};

	return {
		finish: async () => {
			pause();
			if (plugin) await client.remove(plugin.name).promise;
		},
		pause,
		start: async (): Promise<boolean> => {
			const { sessionReplayPlugin } = await import('@amplitude/plugin-session-replay-browser');
			if (paused || client.getOptOut()) return false;
			plugin = sessionReplayPlugin({ sampleRate: 1 });
			await client.add(plugin).promise;
			if (paused || client.getOptOut()) {
				plugin.stop();
				return false;
			}
			return true;
		},
	};
}
