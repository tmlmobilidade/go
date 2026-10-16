import { type Types } from '@amplitude/analytics-browser';
import { type SessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

import { type AnalyticsReplayController } from '../types/shared/analytics';

/* * */

/** Loads the plugin only when a flow explicitly requests capture. */
export function createSessionReplayController(client: Types.BrowserClient): AnalyticsReplayController {
	let plugin: SessionReplayPlugin | undefined;
	let loading: Promise<SessionReplayPlugin | undefined> | undefined;
	let requested = false;
	let generation = 0;

	const load = () => {
		if (loading !== undefined) return loading;
		if (plugin) return Promise.resolve(plugin);

		loading = import('@amplitude/plugin-session-replay-browser')
			.then(async ({ sessionReplayPlugin }) => {
				if (!requested || client.getOptOut()) return;
				plugin = sessionReplayPlugin({ sampleRate: 1 });
				await client.add(plugin).promise;
				return plugin;
			})
			.catch((cause: unknown) => {
				plugin?.stop();
				plugin = undefined;
				throw cause;
			})
			.finally(() => { loading = undefined; });
		return loading;
	};

	return {
		start: async () => {
			if (client.getOptOut()) return false;
			if (requested && plugin && loading === undefined) return true;
			requested = true;
			const currentGeneration = ++generation;
			const replay = await load();
			if (!replay) return false;
			if (!requested || client.getOptOut()) {
				replay.stop();
				return false;
			}
			if (currentGeneration !== generation) return false;

			await replay.start();
			if (!requested || client.getOptOut()) {
				replay.stop();
				return false;
			}
			return currentGeneration === generation;
		},
		stop: () => {
			requested = false;
			generation++;
			plugin?.stop();
		},
	};
}
