'use client';

import { Tooltip } from '@mantine/core';
import { type CalendarDay, Dates } from '@tmlmobilidade/dates';
import { type CalendarEvent } from '@tmlmobilidade/types';
import React, { useMemo } from 'react';

import styles from './styles.module.css';

import { DayTooltip } from '../DayTooltip';

/* * */

export interface YearlyCalendarMonthProps {
	events?: CalendarEvent[]
	month: number
	monthGrid: { monthName: string, weeks: CalendarDay[][] }
	onDayClick?: (day: CalendarDay) => void
	onEventClick?: (event: CalendarEvent) => void
	onMonthClick?: () => void
	year: number
}

/* * */

const WEEK_DAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/* * */

export function YearlyCalendarMonth({
	events = [],
	monthGrid,
	onDayClick,
	onEventClick,
	onMonthClick,
}: YearlyCalendarMonthProps) {
	//

	// Map events to days
	const eventsByDate = useMemo(() => {
		const map = new Map<string, CalendarEvent[]>();

		events.forEach((event) => {
			const startOp = Dates.fromISO(event.startDate).operational_date;
			const endOp = event.endDate
				? Dates.fromISO(event.endDate).operational_date
				: startOp;

			monthGrid.weeks.flat().forEach((day) => {
				const dateKey = day.date.operational_date;

				if (dateKey >= startOp && dateKey <= endOp) {
					const existing = map.get(dateKey) || [];
					map.set(dateKey, [...existing, event]);
				}
			});
		});

		return map;
	}, [events, monthGrid.weeks]);

	const handleDayClick = (day: CalendarDay) => {
		if (onDayClick) {
			onDayClick(day);
		}
	};

	const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
		e.stopPropagation();
		if (onEventClick) {
			onEventClick(event);
		}
	};

	return (
		<div className={styles.monthContainer}>
			{/* Month Header */}
			<div
				className={styles.monthHeader}
				onClick={onMonthClick}
			>
				{monthGrid.monthName}
			</div>

			{/* Week Days */}
			<div className={styles.weekDays}>
				{WEEK_DAYS_SHORT.map((day, index) => (
					<div key={index} className={styles.weekDay}>
						{day}
					</div>
				))}
			</div>

			{/* Weeks */}
			<div className={styles.weeksContainer}>
				{monthGrid.weeks.map((week, weekIndex) => (
					<div key={weekIndex} className={styles.week}>
						{week.map((day, dayIndex) => {
							const dayEvents = eventsByDate.get(day.date.operational_date) || [];
							const hasEvents = dayEvents.length > 0;

							const dayClassName = [
								styles.day,
								!day.isCurrentMonth && styles.otherMonth,
								day.isToday && styles.today,
								day.isWeekend && styles.weekend,
								hasEvents && styles.hasEvents,
							].filter(Boolean).join(' ');

							const tooltipDate = day.date.toFormat('cccc d \'de\' MMMM \'de\' yyyy')
								.replace(/^./, char => char.toUpperCase());

							const dayCell = (
								<div
									key={dayIndex}
									className={dayClassName}
									onClick={() => handleDayClick(day)}
								>
									<div className={styles.dayNumber}>
										{day.dayOfMonth}
									</div>
									{hasEvents && (
										<div className={styles.eventIndicators}>
											{dayEvents.slice(0, 3).map(event => (
												<div
													key={event.id}
													className={styles.eventDot}
													onClick={e => handleEventClick(event, e)}
													style={{ backgroundColor: event.color }}
												/>
											))}
											{dayEvents.length > 3 && (
												<div className={styles.moreIndicator}>
													+{dayEvents.length - 3}
												</div>
											)}
										</div>
									)}
								</div>
							);

							return hasEvents ? (
								<Tooltip
									key={dayIndex}
									label={<DayTooltip date={tooltipDate} events={dayEvents} />}
									position="top"
									multiline
								>
									{dayCell}
								</Tooltip>
							) : dayCell;
						})}
					</div>
				))}
			</div>
		</div>
	);
}
