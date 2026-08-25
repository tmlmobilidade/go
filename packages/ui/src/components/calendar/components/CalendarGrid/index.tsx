'use client';

import { Tooltip } from '@mantine/core';
import { type CalendarDay } from '@tmlmobilidade/dates';
import { type CalendarEvent } from '@tmlmobilidade/types';
import React, { useMemo } from 'react';

import styles from './styles.module.css';

import { EventPosition, mapEventsToVisibleDays } from '../../utils/mapEventsToDays';
import { CalendarEventComponent } from '../CalendarEvent';
import { DayTooltip } from '../DayTooltip';

/* * */

export interface CalendarGridProps {
	events?: CalendarEvent[]
	onDayClick?: (date: CalendarDay) => void
	onEventClick?: (event: CalendarEvent) => void
	weeks: CalendarDay[][]
}

/* * */

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/* * */

export function CalendarGrid({ events = [], onDayClick, onEventClick, weeks }: CalendarGridProps) {
	//

	// Map events to days with position information
	const positionsByDate = useMemo(() => {
		const visibleDays = weeks.flat();
		return mapEventsToVisibleDays(events, visibleDays).positionsByDate;
	}, [events, weeks]);

	return (
		<div className={styles.grid}>
			<div className={styles.weekHeader}>
				{WEEK_DAYS.map(day => (
					<div key={day} className={styles.weekDay}>
						{day}
					</div>
				))}
			</div>

			<div className={styles.weeksContainer}>
				{weeks.map((week, weekIndex) => (
					<div key={weekIndex} className={styles.week}>
						{week.map((day, dayIndex) => {
							const dayEventPositions = (positionsByDate.get(day.calendarKey) as EventPosition[] | undefined) ?? [];

							const periodEventPositions = dayEventPositions.filter(ep => ep.event.type === 'period');
							const otherEventPositions = dayEventPositions.filter(ep => ep.event.type !== 'period');

							const getContainerClass = (baseClass: string, eventPositions: EventPosition[]) => {
								const hasMultiDay = eventPositions.some(ep => !ep.isStart || !ep.isEnd);
								if (!hasMultiDay) return baseClass;

								const classes = [baseClass];
								if (eventPositions.some(ep => ep.isStart && !ep.isEnd)) classes.push(styles.hasEventStart);
								if (eventPositions.some(ep => ep.isMiddle)) classes.push(styles.hasEventMiddle);
								if (eventPositions.some(ep => ep.isEnd && !ep.isStart)) classes.push(styles.hasEventEnd);
								return classes.join(' ');
							};

							const dayClassName = [
								styles.day,
								!day.isCurrentMonth && styles.otherMonth,
								day.isToday && styles.today,
								day.isWeekend && styles.weekend,
							].filter(Boolean).join(' ');

							const tooltipDate = day.date.toFormat('cccc d \'de\' MMMM \'de\' yyyy')
								.replace(/^./, char => char.toUpperCase());

							const dayCell = (
								<div
									key={dayIndex}
									className={dayClassName}
									onClick={() => onDayClick?.(day)}
								>
									{periodEventPositions.length > 0 && (
										<div className={getContainerClass(styles.periodsContainer, periodEventPositions)}>
											{periodEventPositions.map(eventPos => (
												<CalendarEventComponent
													key={eventPos.event.id}
													event={eventPos.event}
													isEnd={eventPos.isEnd}
													isMiddle={eventPos.isMiddle}
													isStart={eventPos.isStart}
													onClick={onEventClick}
												/>
											))}
										</div>
									)}

									<div className={styles.dayHeader}>
										<div className={styles.dayNumber}>
											{day.dayOfMonth}
										</div>
									</div>

									{otherEventPositions.length > 0 && (
										<div className={getContainerClass(styles.eventsContainer, otherEventPositions)}>
											{otherEventPositions.map(eventPos => (
												<CalendarEventComponent
													key={eventPos.event.id}
													event={eventPos.event}
													isEnd={eventPos.isEnd}
													isMiddle={eventPos.isMiddle}
													isStart={eventPos.isStart}
													onClick={onEventClick}
												/>
											))}
										</div>
									)}
								</div>
							);

							return dayEventPositions.length > 0 ? (
								<Tooltip
									key={dayIndex}
									label={<DayTooltip calendarEvents={dayEventPositions.map(ep => ep.event)} date={tooltipDate} />}
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
