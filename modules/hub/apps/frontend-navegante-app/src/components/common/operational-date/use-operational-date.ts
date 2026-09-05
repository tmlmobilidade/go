'use client';

import { useSessionStorage } from '@mantine/hooks';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useMemo } from 'react';

/* * */

interface UseOperationalDateReturnType {
	isTodaySelected: boolean
	isTomorrowSelected: boolean
	selectedOperationalDate: null | OperationalDateInt
	setOperationalDate: (value: OperationalDateInt) => void
	setOperationalDateFromFormat: (value: string, format?: string) => void
	setOperationalDateFromJsDate: (value: Date) => void
	setOperationalDateToToday: () => void
	setOperationalDateToTomorrow: () => void
	todayOperationalDate: OperationalDateInt
	tomorrowOperationalDate: OperationalDateInt
}

/**
 * A hook that provides the operational date, flags,
 * and a set of functions to set it.
 */
export function useOperationalDate(): UseOperationalDateReturnType {
	//

	//
	// A. Setup variables

	const defaultOperationalDate = useMemo(() => {
		return Dates.now('local').operational_date_int;
	}, []);

	const [selectedOperationalDate, setSelectedOperationalDate] = useSessionStorage<OperationalDateInt>({
		defaultValue: defaultOperationalDate,
		key: 'operational-date-int',
	});

	//
	// B. Transform data

	const todayOperationalDate = useMemo(() => {
		return Dates.now('local').operational_date_int;
	}, []);

	const tomorrowOperationalDate = useMemo(() => {
		return Dates.now('local').plus({ days: 1 }).operational_date_int;
	}, []);

	const isTodaySelected = useMemo(() => {
		return selectedOperationalDate === todayOperationalDate;
	}, [selectedOperationalDate, todayOperationalDate]);

	const isTomorrowSelected = useMemo(() => {
		return selectedOperationalDate === tomorrowOperationalDate;
	}, [selectedOperationalDate, tomorrowOperationalDate]);

	//
	// C. Handle actions

	const setOperationalDate = (value: OperationalDateInt) => {
		const operationalDateValue = Dates
			.fromOperationalDateInt(value, 'local')
			.set({ hour: 15 })
			.operational_date_int;
		setSelectedOperationalDate(operationalDateValue);
	};

	const setOperationalDateFromFormat = (value: string, format = 'yyyy-MM-dd') => {
		const operationalDateValue = Dates
			.fromFormat(value, format, 'local')
			.set({ hour: 15 })
			.operational_date_int;
		setSelectedOperationalDate(operationalDateValue);
	};

	const setOperationalDateFromJsDate = (value: Date) => {
		const operationalDateValue = Dates
			.fromJSDate(value)
			.set({ hour: 15 })
			.operational_date_int;
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
		setOperationalDate,
		setOperationalDateFromFormat,
		setOperationalDateFromJsDate,
		setOperationalDateToToday,
		setOperationalDateToTomorrow,
		todayOperationalDate,
		tomorrowOperationalDate,
	};
}
