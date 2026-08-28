'use client';

import { Tooltip } from '@mantine/core';
import { type ScheduleEventData, type ScheduleProps } from '@mantine/schedule';
import { type CSSProperties } from 'react';

import styles from './styles.module.css';

import { type CalendarSchedulePayload, isCalendarSchedulePayload } from '../../utils/calendar-schedule-events';
import { CalendarScheduleDaySummary } from '../CalendarScheduleDaySummary';

/* * */

export interface CalendarScheduleYearDayProps {
	date: string
	events: ScheduleEventData[]
	locale: string
	onEventClick?: ScheduleProps['onEventClick']
}

/* * */

export function CalendarScheduleYearDay({ date, events, locale, onEventClick }: CalendarScheduleYearDayProps) {
	//

	//
	// A. Setup variables

	const scheduleEvents = events.filter((event): event is ScheduleEventData<CalendarSchedulePayload> => isCalendarSchedulePayload(event.payload));
	const indicatorEvents = scheduleEvents.filter(event => event.payload.type !== 'rule-impact');

	//
	// B. Render components

	const dayContent = (
		<span
			className={styles.dayContent}
			data-has-events={indicatorEvents.length > 0 || undefined}
			data-with-tooltip={indicatorEvents.length > 0 || undefined}
		>
			<span data-year-day-number>{Number(date.slice(-2))}</span>
			{indicatorEvents.length > 0 && (
				<span className={styles.indicators}>
					{indicatorEvents.slice(0, 3).map(event => (
						<span
							key={event.id}
							className={styles.indicator}
							data-type={event.payload.type}
							style={event.payload.type === 'period' && event.color ? { '--event-type-color': event.color } as CSSProperties : undefined}
						/>
					))}
				</span>
			)}
		</span>
	);

	if (indicatorEvents.length === 0) return dayContent;

	return (
		<Tooltip
			classNames={{ arrow: styles.tooltipArrow, tooltip: styles.tooltip }}
			events={{ focus: true, hover: true, touch: false }}
			label={<CalendarScheduleDaySummary date={date} events={indicatorEvents} locale={locale} onEventClick={onEventClick} />}
			openDelay={350}
			position="top"
			interactive
			multiline
			withArrow
			withinPortal
		>
			{dayContent}
		</Tooltip>
	);

	//
}
