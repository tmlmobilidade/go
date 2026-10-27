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
	periodDisplay?: 'background' | 'muted' | 'none'
	withTooltip?: boolean
}

/* * */

export function CalendarScheduleYearDay({ date, events, locale, onEventClick, periodDisplay = 'background', withTooltip = true }: CalendarScheduleYearDayProps) {
	//

	//
	// A. Setup variables

	const scheduleEvents = events.filter((event): event is ScheduleEventData<CalendarSchedulePayload> => isCalendarSchedulePayload(event.payload));
	const summaryEvents = scheduleEvents.filter(event => event.payload.type !== 'rule-impact');
	const periodEvents = summaryEvents.filter(event => event.payload.type === 'period');
	const indicatorEvents = summaryEvents.filter(event => event.payload.type !== 'period');
	const periodColors = [...new Set(periodEvents.map(event => event.color || '#3b82f6'))];
	const periodBackground = periodColors.length > 1
		? `linear-gradient(135deg, ${periodColors.map((color, index) => `color-mix(in srgb, ${color}, transparent var(--period-transparency)) ${index * 100 / periodColors.length}% ${(index + 1) * 100 / periodColors.length}%`).join(', ')})`
		: undefined;
	const periodStyle = periodColors.length > 0 ? {
		'--period-background': periodBackground,
		'--period-color': periodColors[0],
	} as CSSProperties : undefined;

	//
	// B. Render components

	const dayContent = (
		<span
			className={styles.dayContent}
			data-has-events={indicatorEvents.length > 0 || undefined}
			data-period-display={periodColors.length > 0 && periodDisplay !== 'none' ? periodDisplay : undefined}
			data-with-tooltip={(withTooltip && summaryEvents.length > 0) || undefined}
			style={periodStyle}
		>
			<span data-year-day-number>{Number(date.slice(-2))}</span>
			{indicatorEvents.length > 0 && (
				<span className={styles.indicators}>
					{indicatorEvents.slice(0, 3).map(event => (
						<span
							key={event.id}
							className={styles.indicator}
							data-type={event.payload.type}
						/>
					))}
				</span>
			)}
		</span>
	);

	if (!withTooltip || summaryEvents.length === 0) return dayContent;

	return (
		<Tooltip
			classNames={{ arrow: styles.tooltipArrow, tooltip: styles.tooltip }}
			events={{ focus: true, hover: true, touch: false }}
			label={<CalendarScheduleDaySummary date={date} events={summaryEvents} locale={locale} onEventClick={onEventClick} />}
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
