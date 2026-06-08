'use client';

/* * */

import pjson from '#/package.json';
import { type Ampli, ampli } from '@/amplitude';
import { createContext, useContext } from 'react';

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

	const capture = (_callback: (instance: Ampli, props: DefaultEventProps) => void) => {
		// Skip if Ampli is not loaded
		if (!ampli?.isLoaded) return;
		// Skip if window or document are not available
		if (typeof window === 'undefined' && typeof document === 'undefined') return;
		// Setup default properties for all events
		const _defaultProps: DefaultEventProps = {
			app_version: pjson.version,
			domain: window.location.hostname,
			locale: document.documentElement.lang,
			pathname: window.location.pathname,
			referrer: document.referrer,
			referring_domain: document.referrer ? new URL(document.referrer).hostname : '',
		};
		// Execute the callback with the default event properties
		_callback(ampli, _defaultProps);
	};

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
