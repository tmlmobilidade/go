'use client';

import { Calendar } from '@mantine/dates';
import { Dates } from '@tmlmobilidade/dates';
import React, { useEffect, useState } from 'react';
import 'dayjs/locale/pt';

import styles from './styles.module.css';

import { useCalendarUIContext } from '../../contexts/CalendarUI.context';

/* * */

export function MiniCalendar() {
	//

	const context = useCalendarUIContext();

	// Track mini calendar's own displayed month independently
	const [miniDisplayedMonth, setMiniDisplayedMonth] = useState<Date>(
		new Date(context.state.year, context.state.month - 1),
	);

	// Sync mini calendar with main calendar when context changes
	useEffect(() => {
		setMiniDisplayedMonth(new Date(context.state.year, context.state.month - 1));
	}, [context.state.month, context.state.year]);

	// Always highlight today's date
	const today = new Date();
	const todayString = today.toISOString().split('T')[0];

	const handleDateClick = (dateString: string) => {
		// Convert ISO string to Date, then to Dates object
		const jsDate = new Date(dateString);
		const datesObj = Dates.fromJSDate(jsDate);

		// Update context with selected month/year (this updates the main calendar)
		context.actions.setMonth(
			Number.parseInt(datesObj.toFormat('MM')),
			Number.parseInt(datesObj.toFormat('yyyy')),
		);
	};

	const handleMonthChange = (dateString: string) => {
		const jsDate = new Date(dateString);
		// Only update the mini calendar's local state, don't update context
		setMiniDisplayedMonth(jsDate);
	};

	return (
		<div className={styles.container}>
			<Calendar
				classNames={styles}
				date={miniDisplayedMonth}
				locale="pt"
				onDateChange={handleMonthChange}
				getDayProps={date => ({
					onClick: () => handleDateClick(date),
					selected: date === todayString,
				})}
			/>
		</div>
	);

	//
}
