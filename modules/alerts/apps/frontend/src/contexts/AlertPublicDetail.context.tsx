'use client';

/* * */

import { type Alert } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useAlertsPublicListContext } from './AlertsPublicList.context';

/* * */

interface AlertDetailPublicContextState {
	data: {
		alert: Alert | undefined
	}
	flags: {
		loading: boolean
		notFound: boolean
	}
}

/* * */

const AlertDetailPublicContext = createContext<AlertDetailPublicContextState | undefined>(undefined);

export function useAlertDetailPublicContext() {
	const context = useContext(AlertDetailPublicContext);
	if (!context) {
		throw new Error('useAlertDetailPublicContext must be used within a AlertDetailPublicContextProvider');
	}
	return context;
}

/* * */

export const AlertPublicDetailContextProvider = ({ alertId, children }: PropsWithChildren<{ alertId: string }>) => {
	//

	//
	// A. Setup variables

	const alertsPublicListContext = useAlertsPublicListContext();

	//
	// B. Transform data

	const foundAlert = useMemo(() => {
		if (alertsPublicListContext.flags.loading) return undefined;
		return alertsPublicListContext.data.raw.find(alert => alert._id === alertId);
	}, [alertsPublicListContext.flags.loading, alertsPublicListContext.data.raw, alertId]);
	const isLoading = alertsPublicListContext.flags.loading;
	const isNotFound = !isLoading && !foundAlert;

	//
	// E. Define context value

	const contextValue: AlertDetailPublicContextState = {
		data: {
			alert: foundAlert,
		},
		flags: {
			loading: isLoading,
			notFound: isNotFound,
		},
	};

	//
	// F. Render components

	return (
		<AlertDetailPublicContext.Provider value={contextValue}>
			{children}
		</AlertDetailPublicContext.Provider>
	);

	//
};
