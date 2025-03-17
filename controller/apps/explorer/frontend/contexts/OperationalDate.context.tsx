'use client';

/* * */

import { OPERATIONAL_DATE_FORMAT, type OperationalDate } from '@tmlmobilidade/core/types';
import { getOperationalDate } from '@tmlmobilidade/core/utils';
import { DateTime } from 'luxon';
import { createContext, useContext, useMemo, useState } from 'react';

/* * */

interface OperationalDateContextState {
	actions: {
		updateSelectedDate: (value: string) => void
		updateSelectedDateFromJsDate: (value: Date) => void
		updateSelectedDateToLessOneDay: () => void
		updateSelectedDateToPlusOneDay: () => void
		updateSelectedDateToToday: () => void
		updateSelectedDateToTomorrow: () => void
	}
	data: {
		selected_date: OperationalDate
	}
	flags: {
		is_today_selected: boolean
		is_tomorrow_selected: boolean
	}
}

/* * */

const OperationalDateContext = createContext<OperationalDateContextState | undefined>(undefined);

export function useOperationalDateContext() {
	const context = useContext(OperationalDateContext);
	if (!context) {
		throw new Error('useOperationalDateContext must be used within a OperationalDateContextProvider');
	}
	return context;
}

/* * */

export const OperationalDateContextProvider = ({ children }) => {
	//

	//
	// A. Setup variables

	// const [selectedDate, setSelectedDate] = useState(getOperationalDate());
	const [selectedDate, setSelectedDate] = useState('20250307' as OperationalDate);

	//
	// C. Handle actions

	const updateSelectedDate = (operationalDate: OperationalDate) => {
		setSelectedDate(operationalDate);
	};

	const updateSelectedDateFromJsDate = (value: Date) => {
		const valueAsString = DateTime.fromJSDate(value).toFormat(OPERATIONAL_DATE_FORMAT) as OperationalDate;
		setSelectedDate(valueAsString);
	};

	const updateSelectedDateToToday = () => {
		const todayOperationalDate = getOperationalDate();
		setSelectedDate(todayOperationalDate);
	};

	const updateSelectedDateToTomorrow = () => {
		const todayOperationalDate = getOperationalDate();
		const tomorrowOperationalDate = DateTime
			.fromFormat(todayOperationalDate, OPERATIONAL_DATE_FORMAT)
			.plus({ days: 1 })
			.toFormat(OPERATIONAL_DATE_FORMAT) as OperationalDate;
		setSelectedDate(tomorrowOperationalDate);
	};

	const updateSelectedDateToPlusOneDay = () => {
		const selectedDatePlusOneDay = DateTime
			.fromFormat(selectedDate, OPERATIONAL_DATE_FORMAT)
			.plus({ days: 1 })
			.toFormat('yyyyMMdd') as OperationalDate;
		setSelectedDate(selectedDatePlusOneDay);
	};

	const updateSelectedDateToLessOneDay = () => {
		const selectedDatePlusOneDay = DateTime
			.fromFormat(selectedDate, OPERATIONAL_DATE_FORMAT)
			.minus({ days: 1 })
			.toFormat('yyyyMMdd') as OperationalDate;
		setSelectedDate(selectedDatePlusOneDay);
	};

	//
	// D. Define context value

	const contextValue: OperationalDateContextState = useMemo(() => ({
		actions: {
			updateSelectedDate,
			updateSelectedDateFromJsDate,
			updateSelectedDateToLessOneDay,
			updateSelectedDateToPlusOneDay,
			updateSelectedDateToToday,
			updateSelectedDateToTomorrow,
		},
		data: {
			selected_date: selectedDate,
		},
		flags: {
			is_today_selected: true, // selectedDate === todayOperationalDate,
			is_tomorrow_selected: true, // selectedDate === tomorrowDateString,
		},
	}), [selectedDate]);

	//
	// E. Render components

	return (
		<OperationalDateContext.Provider value={contextValue}>
			{children}
		</OperationalDateContext.Provider>
	);

	//
};
