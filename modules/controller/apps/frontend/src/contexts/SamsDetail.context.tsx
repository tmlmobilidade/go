'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Sam, SystemStatus, type UnixTimestamp } from '@tmlmobilidade/types';
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
		setAnalysisApexVersionFilter: (values: string[]) => void
		setAnalysisFilterEnd: (value: null | UnixTimestamp) => void
		setAnalysisFilterStart: (value: null | UnixTimestamp) => void
	}
	data: {
		sam: null | Sam
		status: SystemStatus
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
	ui: {
		analysisApexVersionFilter: string[]
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
	const [analysisApexVersionFilter, setAnalysisApexVersionFilter] = useState<string[]>([]);
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

	//

	const setAnalysisFilterStart = useCallback((value: null | UnixTimestamp) => {
		setAnalysisFilterStartTime(value);
		setSelectedDayKey(null);
	}, []);

	//

	const setAnalysisFilterEnd = useCallback((value: null | UnixTimestamp) => {
		setAnalysisFilterEndTime(value);
		setSelectedDayKey(null);
	}, []);

	//

	const setAnalysisApexVersionFilterAction = useCallback((values: string[]) => {
		setAnalysisApexVersionFilter(values);
	}, []);

	//

	const getSamStatus = (sam: Sam): SystemStatus => {
		const analyses = sam.analysis ?? [];
		if (!analyses.length) return 'error';

		const isNullish = (value: unknown) => value === null || value === undefined;

		const allAnalysesAreFullyNull = analyses.every(analysis =>
			Object.values(analysis).every(isNullish),
		);
		if (allAnalysesAreFullyNull) return 'error';

		const hasAnyNullFieldInAnyAnalysis = analyses.some(analysis =>
			Object.values(analysis).some(isNullish),
		);
		if (hasAnyNullFieldInAnyAnalysis) return 'incomplete';

		return 'complete';
	};

	//
	// D. Define context value

	const contextValue: SamsDetailContextState = useMemo(() => ({
		actions: {
			applyAnalysisFilterFromCalendarDay,
			setAnalysisApexVersionFilter: setAnalysisApexVersionFilterAction,
			setAnalysisFilterEnd,
			setAnalysisFilterStart,
		},
		data: {
			sam: samData ?? null,
			status: getSamStatus(samData ?? { analysis: [] } as Sam),
		},
		flags: {
			error: samError,
			loading: samLoading,
		},
		ui: {
			analysisApexVersionFilter,
			analysisFilterEndTime,
			analysisFilterStartTime,
			listOpenVersion,
			selectedDayKey,
		},
	}), [analysisApexVersionFilter, analysisFilterEndTime, analysisFilterStartTime, applyAnalysisFilterFromCalendarDay, listOpenVersion, samError, samLoading, samData, selectedDayKey, setAnalysisApexVersionFilterAction, setAnalysisFilterEnd, setAnalysisFilterStart]);

	//
	// E. Render components

	return (
		<SamsDetailContext.Provider value={contextValue}>
			{children}
		</SamsDetailContext.Provider>
	);
}
