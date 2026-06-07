'use client';

import { useSessionStorage } from '@mantine/hooks';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDate } from '@tmlmobilidade/types';
import { useMemo } from 'react';

/* * */

interface UseOperationalDateReturnType {
	isTodaySelected: boolean
	isTomorrowSelected: boolean
	selectedOperationalDate: null | OperationalDate
	selectedOperationalDateAsJsDate: Date | null
	setOperationalDate: (value: OperationalDate) => void
	setOperationalDateFromFormat: (value: string, format?: string) => void
	setOperationalDateFromJsDate: (value: Date) => void
	setOperationalDateToToday: () => void
	setOperationalDateToTomorrow: () => void
	todayOperationalDate: OperationalDate
	tomorrowOperationalDate: OperationalDate
}

/**
 * A hook that provides the operational date, flags,
 * and a set of functions to set it.
 */
export function useOperationalDate(): UseOperationalDateReturnType {
	//

	//
	// A. Setup variables

	const [selectedOperationalDate, setSelectedOperationalDate] = useSessionStorage<OperationalDate>({
		defaultValue: Dates.now('Europe/Lisbon').operational_date,
		key: 'operational-date',
	});

	//
	// B. Transform data

	const todayOperationalDate = useMemo(() => {
		return Dates.now('Europe/Lisbon').operational_date;
	}, []);

	const tomorrowOperationalDate = useMemo(() => {
		return Dates.now('Europe/Lisbon').plus({ days: 1 }).operational_date;
	}, []);

	const isTodaySelected = useMemo(() => {
		return selectedOperationalDate === todayOperationalDate;
	}, [selectedOperationalDate, todayOperationalDate]);

	const isTomorrowSelected = useMemo(() => {
		return selectedOperationalDate === tomorrowOperationalDate;
	}, [selectedOperationalDate, tomorrowOperationalDate]);

	const selectedOperationalDateAsJsDate = useMemo(() => {
		if (!selectedOperationalDate) return null;
		return Dates
			.fromOperationalDate(selectedOperationalDate, 'Europe/Lisbon')
			.set({ hour: 15 })
			.js_date;
	}, [selectedOperationalDate]);

	//
	// C. Handle actions

	const setOperationalDate = (value: OperationalDate) => {
		const operationalDateValue = Dates
			.fromOperationalDate(value, 'Europe/Lisbon')
			.set({ hour: 15 })
			.operational_date;
		setSelectedOperationalDate(operationalDateValue);
	};

	const setOperationalDateFromFormat = (value: string, format = 'yyyy-MM-dd') => {
		const operationalDateValue = Dates
			.fromFormat(value, format, 'Europe/Lisbon')
			.set({ hour: 15 })
			.operational_date;
		setSelectedOperationalDate(operationalDateValue);
	};

	const setOperationalDateFromJsDate = (value: Date) => {
		const operationalDateValue = Dates
			.fromJSDate(value)
			.set({ hour: 15 })
			.operational_date;
		setSelectedOperationalDate(operationalDateValue);
	};

	const setOperationalDateToToday = () => {
		setSelectedOperationalDate(todayOperationalDate);
	};

	const setOperationalDateToTomorrow = () => {
		setSelectedOperationalDate(tomorrowOperationalDate);
	};

	//
	// D. Return data

	return {
		isTodaySelected,
		isTomorrowSelected,
		selectedOperationalDate,
		selectedOperationalDateAsJsDate,
		setOperationalDate,
		setOperationalDateFromFormat,
		setOperationalDateFromJsDate,
		setOperationalDateToToday,
		setOperationalDateToTomorrow,
		todayOperationalDate,
		tomorrowOperationalDate,
	};
}
