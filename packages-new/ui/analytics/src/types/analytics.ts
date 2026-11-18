import { type Types } from '@amplitude/analytics-browser';
import { type UserSessionReplayAuthorization } from '@tmlmobilidade/go-types-core';

import { type AnalyticsEventInput } from './events/shared.js';
import { type AnalyticsUserProperties } from './user-properties.js';

/* * */

export interface AnalyticsContextProps {
	apiKey?: string
	configurationUrl?: string
	options?: Types.BrowserOptions
	/** Authorization received with the current user's /me response. */
	replayAuthorization?: null | UserSessionReplayAuthorization
	/** Authenticated GO endpoint that accepts the first capture start. */
	replayStartUrl?: string
	/** Undefined leaves identity unchanged; null clears the authenticated user. */
	user?: AnalyticsUserProperties | null
}

export interface AnalyticsContextState {
	actions: {
		identify: (user: AnalyticsUserProperties | null) => boolean
		track: (event: AnalyticsEventInput, properties?: Record<string, unknown>) => Promise<boolean>
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
}
