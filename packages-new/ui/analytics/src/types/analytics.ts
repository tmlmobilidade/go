import { type Types } from '@amplitude/analytics-browser';

import { type AnalyticsEventInput } from './events/shared';
import { type AnalyticsReplayController } from './replay/controller';
import { type AnalyticsUserProperties } from './user-properties';

export { type AnalyticsReplayController } from './replay/controller';

/* * */

export interface AnalyticsContextProps {
	apiKey?: string
	configurationUrl?: string
	options?: Types.BrowserOptions
	/** Authenticated GO endpoint for the current user's replay authorization. */
	replayUrl?: string
	/** Undefined leaves identity unchanged; null clears the authenticated user. */
	user?: AnalyticsUserProperties | null
}

export interface AnalyticsContextState {
	actions: {
		identify: (user: AnalyticsUserProperties | null) => boolean
		startReplay: () => Promise<boolean>
		stopReplay: () => void
		track: (event: AnalyticsEventInput, properties?: Record<string, unknown>) => Promise<boolean>
	}
	flags: {
		error: Error | undefined
		ready: boolean
		/** Latest remote decision for the current user; false until a successful evaluation. */
		replayEnabled: boolean
	}
}

export type AnalyticsConfiguration = Pick<AnalyticsContextProps, 'apiKey' | 'options'>;

export interface AnalyticsInitialization {
	apiKey: string
	client: Types.BrowserClient
	options: AnalyticsContextProps['options']
	promise: Promise<void>
	replay: AnalyticsReplayController
}
