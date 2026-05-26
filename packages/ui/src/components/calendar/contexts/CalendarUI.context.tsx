'use client';

import type { CalendarEvent } from '@tmlmobilidade/types';

import { CalendarKey, Dates, generateMonthGrid, keyToYYYYMMDD, type MonthGrid, parseCalendarKey } from '@tmlmobilidade/dates';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/* * */

export interface DateRangeState {
	end: CalendarKey | null
	start: CalendarKey | null
}

/* * */

interface CalendarUIContextState {
	actions: {
		clearRangeSelection: () => void
		nextMonth: () => void
		nextYear: () => void
		previousMonth: () => void
		previousYear: () => void
		setMonth: (month: number, year: number) => void
		setRangeEnd: (date: Dates) => void
		setRangeStart: (date: Dates) => void
		setView: (view: 'month' | 'year') => void
		today: () => void
		toggleEventType: (id: string) => void
	}
	data: {
		eventsByMonth: Map<number, CalendarEvent[]>
		filteredEvents: CalendarEvent[]
		monthGrid: MonthGrid
		monthsData: { grid: MonthGrid, month: number }[]
	}
	state: {
		eventTypeFilters: Map<string, boolean>
		month: number
		rangeSelection: DateRangeState
		showSidebar: boolean
		view: 'month' | 'year'
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
	events?: CalendarEvent[]
	initialEventTypeFilters?: Record<string, boolean>
	initialMonth?: number
	initialYear?: number
	showSidebar?: boolean
}

/* * */

export const CalendarUIContextProvider = ({
	children,
	events = [],
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
	const [view, setView] = useState<'month' | 'year'>('month');
	const [eventTypeFilters, setEventTypeFilters] = useState<Map<string, boolean>>(
		new Map(Object.entries(initialEventTypeFilters)),
	);
	const [rangeSelection, setRangeSelection] = useState<DateRangeState>({
		end: null,
		start: null,
	});

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

	const nextYear = useCallback(() => {
		setYearState(year + 1);
	}, [year]);

	const previousYear = useCallback(() => {
		setYearState(year - 1);
	}, [year]);

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

	const setRangeStart = useCallback((date: Dates) => {
		setRangeSelection({
			end: null,
			start: parseCalendarKey(date),
		});
	}, []);

	const setRangeEnd = useCallback((date: Dates) => {
		setRangeSelection(prev => ({
			...prev,
			end: parseCalendarKey(date),
		}));
	}, []);

	const clearRangeSelection = useCallback(() => {
		setRangeSelection({
			end: null,
			start: null,
		});
	}, []);

	//
	// C. Generate calendar grids

	const monthGrid = useMemo(() => {
		return generateMonthGrid(year, month);
	}, [year, month]);

	const monthsData = useMemo(() => {
		return Array.from({ length: 12 }, (_, index) => {
			const monthNumber = index + 1;
			return {
				grid: generateMonthGrid(year, monthNumber, true),
				month: monthNumber,
			};
		});
	}, [year]);

	//
	// D. Filter events based on UI filters

	const filteredEvents = useMemo(() => {
		return events.filter((event) => {
			// Filter by event type - if filter exists for this type, respect it
			const filterValue = eventTypeFilters.get(event.type);
			return filterValue !== false;
		});
	}, [events, eventTypeFilters]);

	//
	// E. Filter events by month for year view

	const eventsByMonth = useMemo(() => {
		const map = new Map<number, CalendarEvent[]>();

		filteredEvents.forEach((event) => {
			const startKey = keyToYYYYMMDD(parseCalendarKey(event.startDate));
			const endKey = keyToYYYYMMDD(parseCalendarKey(event.endDate ?? event.startDate));

			for (let m = 1; m <= 12; m++) {
				const monthStartKey = `${year}${String(m).padStart(2, '0')}01`;
				const monthEndDay = new Date(year, m, 0).getDate();
				const monthEndKey = `${year}${String(m).padStart(2, '0')}${String(monthEndDay).padStart(2, '0')}`;

				if (startKey <= monthEndKey && endKey >= monthStartKey) {
					const existing = map.get(m) || [];
					map.set(m, [...existing, event]);
				}
			}
		});

		return map;
	}, [filteredEvents, year]);

	//
	// F. Define context value

	const contextValue: CalendarUIContextState = useMemo(() => ({
		actions: {
			clearRangeSelection,
			nextMonth,
			nextYear,
			previousMonth,
			previousYear,
			setMonth,
			setRangeEnd,
			setRangeStart,
			setView,
			today,
			toggleEventType,
		},
		data: {
			eventsByMonth,
			filteredEvents,
			monthGrid,
			monthsData,
		},
		state: {
			eventTypeFilters,
			month,
			rangeSelection,
			showSidebar,
			view,
			year,
		},
	}), [eventTypeFilters, month, year, view, showSidebar, rangeSelection, nextMonth, previousMonth, nextYear, previousYear, setMonth, setView, today, toggleEventType, clearRangeSelection, setRangeStart, setRangeEnd, monthGrid, monthsData, eventsByMonth, filteredEvents]);

	//
	// G. Render components

	return (
		<CalendarUIContext.Provider value={contextValue}>
			{children}
		</CalendarUIContext.Provider>
	);

	//
};
