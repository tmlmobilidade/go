'use client';

import { type PropsWithChildren } from 'react';

import { AnalyticsContext } from '../contexts/Analytics.context';
import { useAnalytics } from '../hooks/use-analytics';
import { useAnalyticsContext } from '../hooks/use-analytics-context';
import { useSessionReplay } from '../hooks/use-session-replay';
import { type AnalyticsContextProps } from '../types/analytics';

/* * */

/** Connects the current user's remote flag to one capture of up to five minutes. */
function SessionReplayCapture() {
	const { flags: { replayEnabled } } = useAnalyticsContext();
	useSessionReplay(replayEnabled);
	return null;
}

/* * */

/** Initializes an isolated client. Tracking is inactive until `flags.ready` is true. */
export function AnalyticsContextProvider({ children, ...props }: PropsWithChildren<AnalyticsContextProps>) {
	const value = useAnalytics(props);
	return (
		<AnalyticsContext.Provider value={value}>
			<SessionReplayCapture />
			{children}
		</AnalyticsContext.Provider>
	);
}
