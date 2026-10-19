import { type Types } from '@amplitude/analytics-browser';

import { type AnalyticsReplayController } from './replay';
import { type AnalyticsUserProperties } from './user-properties';

export { type AnalyticsReplayController } from './replay';

/* * */

export interface AnalyticsContextProps {
	apiKey?: string
	configurationUrl?: string
	options?: Types.BrowserOptions
	/** Undefined leaves identity unchanged; null clears the authenticated user. */
	user?: AnalyticsUserProperties | null
}

export interface AnalyticsContextState {
	actions: {
		identify: (user: AnalyticsUserProperties | null) => boolean
		startReplay: () => Promise<boolean>
		stopReplay: () => void
		track: (eventName: string, properties?: Record<string, unknown>) => Promise<boolean>
	}
	flags: {
		error: Error | undefined
		ready: boolean
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
