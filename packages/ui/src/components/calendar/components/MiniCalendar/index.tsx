'use client';

import { Calendar } from '@mantine/dates';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export interface MiniCalendarProps {
	className?: string
	/** Month being shown by the mini calendar (controlled) */
	displayedMonth: Date

	/** Multi-select support: determines if a given day should appear selected */
	isDateSelected?: (date: Date) => boolean

	/** Overrides the locale inherited from the shared dates provider. */
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
	locale,
	onDayClick,
	onDisplayedMonthChange,
}: MiniCalendarProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Handle calendar dates

	const handleDisplayedMonthChange = (value: string) => {
		// Mantine returns a civil date; parsing it as UTC can move it to the previous day.
		onDisplayedMonthChange(dayjs(value).toDate());
	};

	//
	// C. Render components

	return (
		<div className={className ?? styles.container}>
			<Calendar
				classNames={styles}
				date={displayedMonth}
				locale={locale}
				onDateChange={handleDisplayedMonthChange}
				ariaLabels={{
					monthLevelControl: t('shared:components.calendar.selectMonth'),
					nextDecade: t('shared:components.calendar.nextDecade'),
					nextMonth: t('shared:components.calendar.nextMonth'),
					nextYear: t('shared:components.calendar.nextYear'),
					previousDecade: t('shared:components.calendar.previousDecade'),
					previousMonth: t('shared:components.calendar.previousMonth'),
					previousYear: t('shared:components.calendar.previousYear'),
					yearLevelControl: t('shared:components.calendar.selectYear'),
				}}
				getDayProps={(dayIso) => {
					const dayDate = dayjs(dayIso).toDate();

					return {
						onClick: () => onDayClick?.(dayDate),
						selected: isDateSelected ? isDateSelected(dayDate) : false,
					};
				}}
			/>
		</div>
	);
}
