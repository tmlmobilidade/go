'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';

import { useAnalytics } from '../hooks/use-analytics.js';
import { type AnalyticsContextProps, type AnalyticsContextState } from '../types/analytics.js';

/* * */

const AnalyticsContext = createContext<AnalyticsContextState | undefined>(undefined);

export function useAnalyticsContext(): AnalyticsContextState {
	const context = useContext(AnalyticsContext);

	if (!context) {
		throw new Error('useAnalyticsContext must be used within an AnalyticsContextProvider');
	}

	return context;
}

/** Initializes an isolated client. Tracking is inactive until `flags.ready` is true. */
export function AnalyticsContextProvider({ children, ...props }: PropsWithChildren<AnalyticsContextProps>) {
	const value = useAnalytics(props);
	return (
		<AnalyticsContext.Provider value={value}>
			{children}
		</AnalyticsContext.Provider>
	);
}
