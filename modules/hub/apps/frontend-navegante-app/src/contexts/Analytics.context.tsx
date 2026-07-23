'use client';

/* * */

import pjson from '#/package.json';
import { type Ampli, ampli } from '@/amplitude';
import { AMPLITUDE_BROWSER_OPTIONS, isAmplitudeEnabled } from '@/utils/analytics/config';
import { startAnalyticsHeartbeat } from '@/utils/analytics/heartbeat';
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';

/* * */

interface DefaultEventProps {
	app_version: string
}

interface AnalyticsContextState {
	actions: {
		capture: (callback: (instance: Ampli, props: DefaultEventProps) => void) => void
	}
}

/* * */

const AnalyticsContext = createContext<AnalyticsContextState | undefined>(undefined);

export function useAnalyticsContext() {
	const context = useContext(AnalyticsContext);
	if (!context) {
		throw new Error('useAnalyticsContext must be used within a AnalyticsContextProvider');
	}
	return context;
}

/* * */

export const AnalyticsContextProvider = ({ children }) => {
	//

	//
	// A. Setup variables

	const isEnabled = isAmplitudeEnabled(process.env.NEXT_PUBLIC_ENVIRONMENT);

	//
	// B. Handle actions

	const capture = useCallback((callback: (instance: Ampli, props: DefaultEventProps) => void) => {
		// Skip if Amplitude is disabled for this environment
		if (!isEnabled) return;
		// Skip if Ampli is not loaded
		if (!ampli?.isLoaded) return;
		// Setup default properties for all events
		const defaultProps: DefaultEventProps = {
			app_version: pjson.version,
		};
		// Execute the callback with the default event properties
		callback(ampli, defaultProps);
	}, [isEnabled]);

	useEffect(() => {
		// Do not initialize Amplitude or create timers outside production
		if (!isEnabled) return;

		if (!ampli.isLoaded) {
			void ampli.load({
				client: {
					configuration: {
						...AMPLITUDE_BROWSER_OPTIONS,
						appVersion: pjson.version,
					},
				},
				environment: 'default',
			}).promise;
		}

		// Ping on mount and every minute while the WebView is visible
		const pingActiveSession = () => {
			capture((instance, props) => {
				instance.pingNaveganteTempoReal({ app_version: props.app_version });
			});
		};

		return startAnalyticsHeartbeat({
			addVisibilityChangeListener: listener => document.addEventListener('visibilitychange', listener),
			clearInterval: intervalId => window.clearInterval(intervalId),
			isVisible: () => !document.hidden,
			removeVisibilityChangeListener: listener => document.removeEventListener('visibilitychange', listener),
			setInterval: (callback, intervalMs) => window.setInterval(callback, intervalMs),
		}, pingActiveSession);
	}, [capture, isEnabled]);

	//
	// C. Define context value

	const contextValue = useMemo<AnalyticsContextState>(() => ({
		actions: {
			capture,
		},
	}), [capture]);

	//
	// D. Render components

	return (
		<AnalyticsContext.Provider value={contextValue}>
			{children}
		</AnalyticsContext.Provider>
	);

	//
};
