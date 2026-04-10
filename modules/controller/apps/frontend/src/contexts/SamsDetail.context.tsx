'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Sam, type UnixTimestamp } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';

/* * */

import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

const CALENDAR_TZ = 'Europe/Lisbon';

/* * */

export interface SamsDetailContextState {
	actions: {
		applyAnalysisFilterFromCalendarDay: (dayKey: string) => void
		setAnalysisFilterEnd: (value: null | UnixTimestamp) => void
		setAnalysisFilterStart: (value: null | UnixTimestamp) => void
	}
	data: {
		sam: null | Sam
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
	ui: {
		analysisFilterEndTime: null | UnixTimestamp
		analysisFilterStartTime: null | UnixTimestamp
		listOpenVersion: number
		selectedDayKey: null | string
	}
}

/* * */

export const SamsDetailContext = createContext<SamsDetailContextState | undefined>(undefined);

export const useSamsDetailContext = () => {
	const context = useContext(SamsDetailContext);
	if (!context) {
		throw new Error('useSamsDetailContext must be used within a SamsDetailContextProvider');
	}
	return context;
};

export function SamsDetailContextProvider({ children, samId }: PropsWithChildren<{ samId: string }>) {
	//

	//
	// A. Setup variables

	const { data: samData, error: samError, isLoading: samLoading } = useSWR<Sam, Error>(samId && API_ROUTES.controller.SAMS_DETAIL(samId), { refreshInterval: 5000 });
	const [selectedDayKey, setSelectedDayKey] = useState<null | string>(null);
	const [analysisFilterStartTime, setAnalysisFilterStartTime] = useState<null | UnixTimestamp>(null);
	const [analysisFilterEndTime, setAnalysisFilterEndTime] = useState<null | UnixTimestamp>(null);
	const [listOpenVersion, setListOpenVersion] = useState(0);

	//
	// C. Handle actions
	const applyAnalysisFilterFromCalendarDay = useCallback((dayKey: string) => {
		const dayStart = DateTime.fromISO(dayKey, { zone: CALENDAR_TZ }).startOf('day');
		if (!dayStart.isValid) return;
		const dayEnd = dayStart.endOf('day');
		setSelectedDayKey(dayKey);
		setAnalysisFilterStartTime(dayStart.toMillis() as UnixTimestamp);
		setAnalysisFilterEndTime(dayEnd.toMillis() as UnixTimestamp);
		setListOpenVersion(currentValue => currentValue + 1);
	}, []);

	const setAnalysisFilterStart = useCallback((value: null | UnixTimestamp) => {
		setAnalysisFilterStartTime(value);
		setSelectedDayKey(null);
	}, []);

	const setAnalysisFilterEnd = useCallback((value: null | UnixTimestamp) => {
		setAnalysisFilterEndTime(value);
		setSelectedDayKey(null);
	}, []);

	//
	// D. Define context value

	const contextValue: SamsDetailContextState = useMemo(() => ({
		actions: {
			applyAnalysisFilterFromCalendarDay,
			setAnalysisFilterEnd,
			setAnalysisFilterStart,
		},
		data: {
			sam: samData ?? null,
		},
		flags: {
			error: samError,
			loading: samLoading,
		},
		ui: {
			analysisFilterEndTime,
			analysisFilterStartTime,
			listOpenVersion,
			selectedDayKey,
		},
	}), [analysisFilterEndTime, analysisFilterStartTime, applyAnalysisFilterFromCalendarDay, listOpenVersion, samError, samLoading, samData, selectedDayKey, setAnalysisFilterEnd, setAnalysisFilterStart]);
	// E. Render components

	return (
		<SamsDetailContext.Provider value={contextValue}>
			{children}
		</SamsDetailContext.Provider>
	);
}
