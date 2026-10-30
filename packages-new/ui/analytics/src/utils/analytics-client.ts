import { createInstance, Identify, type Types } from '@amplitude/analytics-browser';

import { type AnalyticsContextProps, type AnalyticsInitialization } from '../types/analytics';
import { type AnalyticsEventInput } from '../types/events/shared';
import { type AnalyticsUserProperties } from '../types/user-properties';
import { normalizeAnalyticsEvent } from './analytics-event';
import { createSessionReplayController } from './session-replay';

/* * */

export function initializeAnalyticsClient(apiKey: string, options: AnalyticsContextProps['options'], onError: (cause: unknown) => void): AnalyticsInitialization {
	const client = createInstance();
	return {
		apiKey,
		client,
		options,
		promise: client.init(apiKey, { autocapture: false, serverZone: 'EU', ...options }).promise,
		replay: createSessionReplayController(client, (cause) => {
			if (!client.getOptOut()) onError(cause);
		}),
	};
}

export function identifyAnalyticsUser(client: Types.BrowserClient, user: AnalyticsUserProperties | null, onError: (cause: unknown) => void): boolean {
	try {
		if (user === null) {
			if (client.getUserId() !== undefined) client.reset();
			return true;
		}

		if (user._id !== undefined) client.setUserId(user._id);
		const identify = new Identify();
		for (const [key, value] of Object.entries(user)) {
			if (value !== undefined) identify.set(key, value);
		}
		client.identify(identify);
		return true;
	} catch (cause: unknown) {
		onError(cause);
		return false;
	}
}

export async function trackAnalyticsEvent(initialization: AnalyticsInitialization, event: AnalyticsEventInput, properties: Record<string, unknown> | undefined, onError: (cause: unknown) => void): Promise<boolean> {
	try {
		const { client } = initialization;
		if (client.getOptOut()) return false;
		const normalizedEvent = normalizeAnalyticsEvent(event);
		const result = await client.track(normalizedEvent.title, properties).promise;
		if (result.code < 200 || result.code >= 300) {
			throw new Error(`Amplitude upload failed (${result.code}): ${result.message}`);
		}
		return true;
	} catch (cause: unknown) {
		onError(cause);
		return false;
	}
}
