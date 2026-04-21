'use client';

/* * */

// import { useLinesContext } from '@/contexts/Lines.context';
// import { getAvailableLines } from '@/lib/alert-utils';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type Alert, type File as FileType } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

import { useAlertsListContext } from './AlertsList.context';

/* * */

interface AlertDetailContextState {
	data: {
		activePeriodStart: string
		alert: Alert | undefined
		image: FileType | undefined
		// linesIds: { label: string, value: string }[]
	}
	flags: {
		loading: boolean
		notFound: boolean
	}
}

/* * */

const AlertDetailContext = createContext<AlertDetailContextState | undefined>(undefined);

export function useAlertDetailContext() {
	const context = useContext(AlertDetailContext);
	if (!context) {
		throw new Error('useAlertDetailContext must be used within a AlertDetailContextProvider');
	}
	return context;
}

/* * */

export const AlertDetailContextProvider = ({ alertId, children }: PropsWithChildren<{ alertId: string }>) => {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();
	// const linesContext = useLinesContext();
	const { data: alertDetailData, error: alertDetailError, isLoading: alertDetailLoading } = useSWR<Alert, Error>(API_ROUTES.alerts.ALERTS_DETAIL(alertId));
	const { data: alertImage } = useSWR<FileType>(API_ROUTES.alerts.ALERTS_DETAIL_IMAGE(alertId));

	//
	// B. Transform data

	const foundAlert = useMemo(() => {
		if (alertDetailData) return alertDetailData;
		if (alertsListContext.flags.loading) return undefined;
		return alertsListContext.data.raw.find(alert => alert._id === alertId);
	}, [alertDetailData, alertsListContext.flags.loading, alertsListContext.data.raw, alertId]);

	const isLoading = alertDetailLoading || alertsListContext.flags.loading;
	const isNotFound = !isLoading && !!alertDetailError && !foundAlert;

	const activePeriodStart = useMemo(() => {
		if (!foundAlert) return '-';
		return Dates.fromUnixTimestamp(foundAlert.active_period_start_date).setZone('Europe/Lisbon', 'offset_only').toFormat('d LLLL yyyy', { locale: 'pt' });
	}, [foundAlert]);

	// const linesIds = useMemo(() => {
	// 	if (!foundAlert) return [];
	// 	return getAvailableLines(foundAlert).map((lineId) => {
	// 		const lineData = linesContext.actions.getLineDataById(lineId);
	// 		const label = lineData ? `${lineData.code} | ${lineData.name}` : lineId;
	// 		return { label, value: lineId };
	// 	});
	// }, [foundAlert, linesContext.actions]);

	//
	// E. Define context value

	const contextValue: AlertDetailContextState = {
		data: {
			activePeriodStart,
			alert: foundAlert,
			image: alertImage,
			// linesIds,
		},
		flags: {
			loading: isLoading,
			notFound: isNotFound,
		},
	};

	//
	// F. Render components

	return (
		<AlertDetailContext.Provider value={contextValue}>
			{children}
		</AlertDetailContext.Provider>
	);

	//
};
