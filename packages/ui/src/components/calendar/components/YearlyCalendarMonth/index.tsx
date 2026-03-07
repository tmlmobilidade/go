'use client';

/* * */

import { Tooltip } from '@mantine/core';
import { type CalendarDay } from '@tmlmobilidade/dates';
import { type CalendarEvent } from '@tmlmobilidade/types';
import React, { useMemo } from 'react';

import styles from './styles.module.css';

import { type DateRangeState } from '../../contexts/CalendarUI.context';
import { mapEventsToVisibleDays } from '../../utils/mapEventsToDays';
import { getDayRangeStatus } from '../../utils/rangeSelection';
import { DayTooltip } from '../DayTooltip';

/* * */

export interface YearlyCalendarMonthProps {
	events?: CalendarEvent[]
	month: number
	monthGrid: { monthName: string, weeks: CalendarDay[][] }
	onDayClick?: (day: CalendarDay) => void
	onEventClick?: (event: CalendarEvent) => void
	onMonthClick?: () => void
	rangeState?: DateRangeState
	year: number
}

/* * */

const WEEK_DAYS_SHORT = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

/* * */

// Handle date selections (adding/replacing periods, etc)

export function YearlyCalendarMonth({
	events = [],
	monthGrid,
	onDayClick,
	onEventClick,
	onMonthClick,
	rangeState,
}: YearlyCalendarMonthProps) {
	//

	// Map events to days
	const eventsByDate = useMemo(() => {
		const visibleDays = monthGrid.weeks.flat();
		return mapEventsToVisibleDays(events, visibleDays).eventsByDate;
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
							const key = day.calendarKey;
							const dayEvents = eventsByDate.get(key) || [];
							const cellEvents = dayEvents.filter(e => e.display === 'cell');
							const stripEvents = dayEvents.filter(e => e.display === 'strip' || (e.type === 'period' && !e.display));
							const dotEvents = dayEvents.filter(e => e.display === 'dot' || (!e.display && e.type !== 'period'));
							const hasEvents = dayEvents.length > 0;
							const hasCellEvent = cellEvents.length > 0;

							// Get range status for styling
							const rangeStatus = rangeState
								? getDayRangeStatus(day.date, rangeState)
								: { isEnd: false, isInRange: false, isStart: false };

							const dayClassName = [
								styles.day,
								!day.isCurrentMonth && styles.otherMonth,
								day.isToday && styles.today,
								day.isWeekend && styles.weekend,
								hasEvents && styles.hasEvents,
								hasCellEvent && styles.hasCellEvent,
								rangeStatus.isStart && day.isCurrentMonth && styles.daySelectedStart,
								rangeStatus.isEnd && day.isCurrentMonth && styles.daySelectedEnd,
								rangeStatus.isInRange && styles.dayInRange,
							].filter(Boolean).join(' ');

							const cellStyle = hasCellEvent ? { backgroundColor: cellEvents[0].color } : undefined;

							const tooltipDate = day.date.toFormat('cccc d \'de\' MMMM \'de\' yyyy')
								.replace(/^./, char => char.toUpperCase());

							const dayCell = (
								<div
									key={dayIndex}
									className={dayClassName}
									data-date={key}
									onClick={() => handleDayClick(day)}
									style={cellStyle}
								>
									{stripEvents.length > 0 && (
										<div className={styles.periodStrips}>
											{stripEvents.slice(0, 2).map(event => (
												<div
													key={event.id}
													className={styles.periodStrip}
													onClick={e => handleEventClick(event, e)}
													style={{ backgroundColor: event.color }}
												/>
											))}
										</div>
									)}
									<div className={styles.dayNumber}>
										{day.dayOfMonth}
									</div>
									{dotEvents.length > 0 && (
										<div className={styles.eventIndicators}>
											{dotEvents.slice(0, 3).map(event => (
												<div
													key={event.id}
													className={styles.eventDot}
													onClick={e => handleEventClick(event, e)}
													style={{ backgroundColor: event.color }}
												/>
											))}
											{dotEvents.length > 3 && (
												<div className={styles.moreIndicator}>
													+{dotEvents.length - 3}
												</div>
											)}
										</div>
									)}
								</div>
							);

							return hasEvents ? (
								<Tooltip
									key={dayIndex}
									label={<DayTooltip calendarEvents={dayEvents} date={tooltipDate} />}
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
