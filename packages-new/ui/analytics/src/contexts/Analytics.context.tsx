'use client';

/* * */

import { type UserAnalytics } from '@tmlmobilidade/go-types-core';
import { createContext, type PropsWithChildren, useContext } from 'react';

/* * */

interface AnalyticsContextState {
	flags: {
		sessionReplayEnabled: boolean
	}
}

interface AnalyticsContextProviderProps extends PropsWithChildren {
	analytics?: null | UserAnalytics
}

/* * */

const AnalyticsContext = createContext<AnalyticsContextState | undefined>(undefined);

export const useAnalyticsContext = () => {
	const context = useContext(AnalyticsContext);
	if (!context) throw new Error('useAnalyticsContext must be used within an AnalyticsContextProvider');
	return context;
};

/* * */

export const AnalyticsContextProvider = ({ analytics, children }: AnalyticsContextProviderProps) => {
	//

	//
	// A. Define context value

	// Users without stored analytics settings have not opted in to session replay
	const contextValue: AnalyticsContextState = {
		flags: {
			sessionReplayEnabled: analytics?.session_replay_enabled ?? false,
		},
	};

	//
	// B. Render components

	return (
		<AnalyticsContext.Provider value={contextValue}>
			{children}
		</AnalyticsContext.Provider>
	);

	//
};
