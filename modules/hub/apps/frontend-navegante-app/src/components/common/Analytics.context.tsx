'use client';

/* * */

import pjson from '#/package.json';
import { type Ampli, ampli } from '@/amplitude';
import { createContext, useContext, useEffect } from 'react';

/* * */

interface DefaultEventProps {
	app_version: string
	domain: string
	locale: string
	pathname: string
	referrer?: string
	referring_domain?: string
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
	// A. Handle actions

	const capture = (callback: (instance: Ampli, props: DefaultEventProps) => void) => {
		// Skip if Ampli is not loaded
		if (!ampli?.isLoaded) return;
		// Skip if window or document are not available
		if (typeof window === 'undefined' || typeof document === 'undefined') return;
		// Setup default properties for all events
		const defaultProps: DefaultEventProps = {
			app_version: pjson.version,
			domain: window.location.hostname,
			locale: document.documentElement.lang,
			pathname: window.location.pathname,
			referrer: document.referrer,
			referring_domain: document.referrer ? new URL(document.referrer).hostname : '',
		};
		// Execute the callback with the default event properties
		callback(ampli, defaultProps);
	};

	useEffect(() => {
		if (!ampli.isLoaded) {
			ampli.load({ client: { configuration: { appVersion: pjson.version, autocapture: false } }, environment: 'default' });
			ampli.client.setOptOut(false);
		}

		// Ping on mount and every minute while the WebView session is open
		const pingActiveSession = () => {
			capture((instance, props) => {
				instance.pingNaveganteTempoReal({ app_version: props.app_version });
			});
		};

		pingActiveSession();

		const intervalId = window.setInterval(pingActiveSession, 60_000);

		return () => {
			window.clearInterval(intervalId);
		};
	}, []);

	//
	// C. Define context value

	const contextValue: AnalyticsContextState = {
		actions: {
			capture,
		},
	};

	//
	// D. Render components

	return (
		<AnalyticsContext.Provider value={contextValue}>
			{children}
		</AnalyticsContext.Provider>
	);

	//
};
