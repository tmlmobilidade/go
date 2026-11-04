'use client';

import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useSessionStorage } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';

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

	const [todayOperationalDate, setTodayOperationalDate] = useState(() => Dates.now('local').operational_date_int);

	const [selectedOperationalDate, setSelectedOperationalDate] = useSessionStorage<OperationalDateInt>({
		defaultValue: todayOperationalDate,
		key: 'operational-date-int',
	});

	useEffect(() => {
		const refreshDate = () => {
			const today = Dates.now('local').operational_date_int;
			setTodayOperationalDate(today);
			if (sessionStorage.getItem('operational-date-selected-on') !== String(today)) {
				setSelectedOperationalDate(today);
				sessionStorage.setItem('operational-date-selected-on', String(today));
			}
		};

		refreshDate();
		document.addEventListener('visibilitychange', refreshDate);
		return () => document.removeEventListener('visibilitychange', refreshDate);
	}, [setSelectedOperationalDate]);

	//
	// B. Transform data

	const tomorrowOperationalDate = useMemo(() => {
		return Dates.fromOperationalDateInt(todayOperationalDate, 'local').plus({ days: 1 }).operational_date_int;
	}, [todayOperationalDate]);

	const isTodaySelected = useMemo(() => {
		return selectedOperationalDate === todayOperationalDate;
	}, [selectedOperationalDate, todayOperationalDate]);

	const isTomorrowSelected = useMemo(() => {
		return selectedOperationalDate === tomorrowOperationalDate;
	}, [selectedOperationalDate, tomorrowOperationalDate]);

	//
	// C. Handle actions

	const selectOperationalDate = (value: OperationalDateInt) => {
		setSelectedOperationalDate(value);
		sessionStorage.setItem('operational-date-selected-on', String(Dates.now('local').operational_date_int));
	};

	const setOperationalDate = (value: OperationalDateInt) => {
		const operationalDateValue = Dates
			.fromOperationalDateInt(value, 'local')
			.set({ hour: 15 })
			.operational_date_int;
		selectOperationalDate(operationalDateValue);
	};

	const setOperationalDateFromFormat = (value: string, format = 'yyyy-MM-dd') => {
		const operationalDateValue = Dates
			.fromFormat(value, format, 'local')
			.set({ hour: 15 })
			.operational_date_int;
		selectOperationalDate(operationalDateValue);
	};

	const setOperationalDateFromJsDate = (value: Date) => {
		const operationalDateValue = Dates
			.fromJSDate(value)
			.set({ hour: 15 })
			.operational_date_int;
		selectOperationalDate(operationalDateValue);
	};

	const setOperationalDateToToday = () => {
		selectOperationalDate(todayOperationalDate);
	};

	const setOperationalDateToTomorrow = () => {
		selectOperationalDate(tomorrowOperationalDate);
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
