import { type Types } from '@amplitude/analytics-browser';
import { type SessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

/* * */

interface ReplayCapture {
	finish: () => Promise<void>
	pause: () => void
	start: () => Promise<boolean>
}

/* * */

export function createReplayCapture(client: Types.BrowserClient): ReplayCapture {
	//
	// Setup variables

	let plugin: SessionReplayPlugin | undefined;
	let paused = false;

	//
	// Handle actions

	const pause = () => {
		paused = true;
		plugin?.stop();
	};

	//
	// Return capture

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

			// Capture may have been stopped while the plugin was loading.
			if (paused || client.getOptOut()) {
				plugin.stop();
				return false;
			}

			return true;
		},
	};
}
