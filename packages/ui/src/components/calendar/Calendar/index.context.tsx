'use client';

/* * */

import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/* * */

interface CalendarUIContextState {
	actions: {
		nextMonth: () => void
		previousMonth: () => void
		setMonth: (month: number, year: number) => void
		today: () => void
		toggleEventType: (id: string) => void
	}
	state: {
		eventTypeFilters: Map<string, boolean>
		month: number
		showSidebar: boolean
		year: number
	}
}

/* * */

const CalendarUIContext = createContext<CalendarUIContextState | undefined>(undefined);

export const useCalendarUIContext = () => {
	const context = useContext(CalendarUIContext);
	if (!context) {
		throw new Error('useCalendarUIContext must be used within a CalendarUIContextProvider');
	}
	return context;
};

/* * */

interface CalendarUIContextProviderProps extends PropsWithChildren {
	initialEventTypeFilters?: Record<string, boolean>
	initialMonth?: number
	initialYear?: number
	showSidebar?: boolean
}

/* * */

export const CalendarUIContextProvider = ({
	children,
	initialEventTypeFilters = {},
	initialMonth,
	initialYear,
	showSidebar = true,
}: CalendarUIContextProviderProps) => {
	//

	//
	// A. Setup state

	const now = new Date();
	const [month, setMonthState] = useState(initialMonth || now.getMonth() + 1);
	const [year, setYearState] = useState(initialYear || now.getFullYear());
	const [eventTypeFilters, setEventTypeFilters] = useState<Map<string, boolean>>(
		new Map(Object.entries(initialEventTypeFilters)),
	);

	//
	// B. Actions

	const nextMonth = useCallback(() => {
		if (month === 12) {
			setMonthState(1);
			setYearState(year + 1);
		}
		else {
			setMonthState(month + 1);
		}
	}, [month, year]);

	const previousMonth = useCallback(() => {
		if (month === 1) {
			setMonthState(12);
			setYearState(year - 1);
		}
		else {
			setMonthState(month - 1);
		}
	}, [month, year]);

	const today = useCallback(() => {
		const now = new Date();
		setMonthState(now.getMonth() + 1);
		setYearState(now.getFullYear());
	}, []);

	const setMonth = useCallback((newMonth: number, newYear: number) => {
		setMonthState(newMonth);
		setYearState(newYear);
	}, []);

	const toggleEventType = useCallback((id: string) => {
		setEventTypeFilters((prev) => {
			const newMap = new Map(prev);
			newMap.set(id, !prev.get(id));
			return newMap;
		});
	}, []);

	//
	// C. Define context value

	const contextValue: CalendarUIContextState = useMemo(() => ({
		actions: {
			nextMonth,
			previousMonth,
			setMonth,
			today,
			toggleEventType,
		},
		state: {
			eventTypeFilters,
			month,
			showSidebar,
			year,
		},
	}), [eventTypeFilters, month, year, showSidebar, nextMonth, previousMonth, setMonth, today, toggleEventType]);

	//
	// D. Render components

	return (
		<CalendarUIContext.Provider value={contextValue}>
			{children}
		</CalendarUIContext.Provider>
	);

	//
};
