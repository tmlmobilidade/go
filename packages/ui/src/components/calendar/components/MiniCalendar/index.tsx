'use client';

import { Calendar } from '@mantine/dates';
import React from 'react';
import 'dayjs/locale/pt';

import styles from './styles.module.css';

/* * */

export interface MiniCalendarProps {
	className?: string
	/** Month being shown by the mini calendar (controlled) */
	displayedMonth: Date

	/** Multi-select support: determines if a given day should appear selected */
	isDateSelected?: (date: Date) => boolean

	/** Optional overrides */
	locale?: string

	/** Called when user clicks a day */
	onDayClick?: (date: Date) => void
	/** Called when user navigates months in the mini calendar */
	onDisplayedMonthChange: (date: Date) => void
}

/* * */

export function MiniCalendar({
	className,
	displayedMonth,
	isDateSelected,
	locale = 'pt',
	onDayClick,
	onDisplayedMonthChange,
}: MiniCalendarProps) {
	return (
		<div className={className ?? styles.container}>
			<Calendar
				classNames={styles}
				date={displayedMonth}
				locale={locale}
				getDayProps={(dayIso) => {
					const dayDate = new Date(dayIso);

					return {
						onClick: () => onDayClick?.(dayDate),
						selected: isDateSelected ? isDateSelected(dayDate) : false,
					};
				}}
				onDateChange={(value) => {
					if (!value) return;
					const jsDate = new Date(value as string);
					onDisplayedMonthChange(jsDate);
				}}
			/>
		</div>
	);
}
