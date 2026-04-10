'use client';

/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { getAvailableLines } from '@/lib/alert-utils';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type Alert, type File as FileType } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

import { useAlertsPublicListContext } from './AlertsPublicList.context';

/* * */

interface AlertDetailPublicContextState {
	data: {
		activePeriodStart: string
		alert: Alert | undefined
		image: FileType | undefined
		linesTags: { label: string, value: string }[]
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
	const linesContext = useLinesContext();
	const { data: alertImage } = useSWR<FileType>(API_ROUTES.alerts.ALERTS_DETAILS_PUBLIC_IMAGE(alertId));

	//
	// B. Transform data

	const foundAlert = useMemo(() => {
		if (alertsPublicListContext.flags.loading) return undefined;
		return alertsPublicListContext.data.raw.find(alert => alert._id === alertId);
	}, [alertsPublicListContext.flags.loading, alertsPublicListContext.data.raw, alertId]);

	const isLoading = alertsPublicListContext.flags.loading;
	const isNotFound = !isLoading && !foundAlert;

	const activePeriodStart = useMemo(() => {
		if (!foundAlert) return '-';
		return Dates.fromUnixTimestamp(foundAlert.active_period_start_date).setZone('Europe/Lisbon', 'offset_only').toFormat('d LLLL yyyy', { locale: 'pt' });
	}, [foundAlert]);

	const linesTags = useMemo(() => {
		if (!foundAlert) return [];
		return getAvailableLines(foundAlert)
			.map(lineId => ({ lineData: linesContext.actions.getLineDataById(lineId), lineId }))
			.filter(item => !!item.lineData)
			.map(item => ({ label: item.lineData.short_name, value: item.lineId }));
	}, [foundAlert, linesContext]);

	//
	// E. Define context value

	const contextValue: AlertDetailPublicContextState = {
		data: {
			activePeriodStart,
			alert: foundAlert,
			image: alertImage,
			linesTags,
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
