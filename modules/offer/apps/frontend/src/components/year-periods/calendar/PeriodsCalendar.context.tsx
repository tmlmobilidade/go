'use client';

import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/* * */

interface PeriodsCalendarContextState {
	actions: {
		setDate: (value: string) => void
	}
	data: {
		date: CalendarDate
	}
}

/* * */

const PeriodsCalendarContext = createContext<PeriodsCalendarContextState | undefined>(undefined);

export function usePeriodsCalendarContext() {
	const context = useContext(PeriodsCalendarContext);
	if (!context) throw new Error('usePeriodsCalendarContext must be used within PeriodsCalendarContextProvider');
	return context;
}

/* * */

export function PeriodsCalendarContextProvider({ children }: PropsWithChildren) {
	//
	// A. Setup variables

	const [date, setDateState] = useState<CalendarDate>(() => Dates.now('local').calendar_date);
	const setDate = useCallback((value: string) => setDateState(toCalendarDate(value.slice(0, 10))), []);
	const value = useMemo(() => ({
		actions: {
			setDate,
		},
		data: {
			date,
		},
	}), [date, setDate]);

	//
	// B. Render components

	return (
		<PeriodsCalendarContext.Provider value={value}>
			{children}
		</PeriodsCalendarContext.Provider>
	);
}
