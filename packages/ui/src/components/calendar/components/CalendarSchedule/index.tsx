'use client';

import { type MonthViewProps, Schedule, ScheduleEvent, type ScheduleEventData, type ScheduleEventProps, type ScheduleProps, type ScheduleViewLevel } from '@mantine/schedule';
import { type TimezoneIdentified } from '@tmlmobilidade/dates';
import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/types';
import clsx from 'clsx';
import { useMemo, useState } from 'react';

import styles from './styles.module.css';

import { buildCalendarScheduleEvents, type CalendarScheduleEventType, type CalendarScheduleSources, isCalendarSchedulePayload } from '../../utils/calendar-schedule-events';
import { CalendarScheduleEvent } from '../CalendarScheduleEvent';
import { CalendarScheduleMonthPopover } from '../CalendarScheduleMonthPopover';
import { CalendarScheduleYearDay } from '../CalendarScheduleYearDay';
import { type CalendarScheduleDateRange, useCalendarScheduleDateRange } from './useCalendarScheduleDateRange';
import { useCalendarScheduleMonthPopover } from './useCalendarScheduleMonthPopover';

/* * */

const DEFAULT_LABELS = {
	month: 'Mês',
	moreLabel: (count: number) => `+${count} eventos`,
	next: 'Seguinte',
	previous: 'Anterior',
	selectMonth: 'Selecionar mês',
	selectYear: 'Selecionar ano',
	switchToMonthView: 'Mudar para a vista mensal',
	switchToYearView: 'Mudar para a vista anual',
	today: 'Hoje',
	viewSelectLabel: 'Vista do calendário',
	year: 'Ano',
};

const SCHEDULE_HEADER_CLASS_NAMES = {
	header: styles.scheduleHeader,
	headerControl: styles.headerControl,
	monthYearSelectControl: styles.monthYearSelectControl,
	monthYearSelectDropdown: styles.monthYearSelectDropdown,
	monthYearSelectTarget: styles.monthYearSelectTarget,
	viewSelect: styles.viewSelect,
};

const MONTH_VIEW_CLASS_NAMES = {
	...SCHEDULE_HEADER_CLASS_NAMES,
	monthView: styles.monthView,
	monthViewDay: styles.monthViewDay,
	monthViewDayLabel: styles.monthViewDayLabel,
	monthViewEvents: styles.monthViewEvents,
	monthViewInner: styles.monthViewInner,
	monthViewScrollArea: styles.monthViewScrollArea,
	monthViewWeek: styles.monthViewWeek,
	monthViewWeekday: styles.monthViewWeekday,
	monthViewWeekdays: styles.monthViewWeekdays,
};

const YEAR_VIEW_CLASS_NAMES = {
	...SCHEDULE_HEADER_CLASS_NAMES,
	yearView: styles.yearView,
	yearViewDay: styles.yearViewDay,
	yearViewMonth: styles.yearViewMonth,
	yearViewMonths: styles.yearViewMonths,
	yearViewWeek: styles.yearViewWeek,
	yearViewWeekdays: styles.yearViewWeekdays,
};

type CalendarScheduleMonthViewProps = Omit<NonNullable<ScheduleProps['monthViewProps']>, 'classNames' | 'getDayProps' | 'renderEvent'>;
type CalendarScheduleYearViewProps = Omit<NonNullable<ScheduleProps['yearViewProps']>, 'classNames' | 'renderDay'>;
type CalendarScheduleYearViewRuntimeProps = NonNullable<ScheduleProps['yearViewProps']> & Pick<ScheduleProps, 'mode'>;
type MonthEventRenderProps = Parameters<NonNullable<MonthViewProps['renderEvent']>>[1];

/* * */

export interface CalendarScheduleDateChanges {
	added?: CalendarDate[]
	removed?: CalendarDate[]
}

export type CalendarScheduleDateRangeAction = 'add' | 'remove';

/* * */

export interface CalendarScheduleProps extends Omit<ScheduleProps, 'classNames' | 'monthViewProps' | 'yearViewProps'> {
	dateChanges?: CalendarScheduleDateChanges
	dateRangeSelectionAction?: CalendarScheduleDateRangeAction | null
	eventTypeFilters?: Partial<Record<CalendarScheduleEventType, boolean>>
	isDateRangeDateApplicable?: (date: CalendarDate, action: CalendarScheduleDateRangeAction) => boolean
	monthViewProps?: CalendarScheduleMonthViewProps
	onSelectedDateRangeChange?: (value: CalendarScheduleDateRange | null) => void
	selectedDateRange?: CalendarScheduleDateRange | null
	sources?: CalendarScheduleSources
	timezone?: TimezoneIdentified
	yearViewProps?: CalendarScheduleYearViewProps
}

/* * */

export function CalendarSchedule({ className, dateChanges, dateRangeSelectionAction, defaultView = 'month', events = [], eventTypeFilters, isDateRangeDateApplicable, labels, locale = 'pt', mode = 'default', monthViewProps, onDayClick, onEventClick, onSelectedDateRangeChange, onViewChange, selectedDateRange, sources, timezone = 'Europe/Lisbon', view, withEventResize, withEventsDragAndDrop, yearViewProps, ...props }: CalendarScheduleProps) {
	//

	//
	// A. Setup variables

	const [uncontrolledView, setUncontrolledView] = useState<ScheduleViewLevel>(defaultView);
	const resolvedView = view ?? uncontrolledView;
	const isDateRangeSelectionEnabled = resolvedView === 'year' && mode !== 'static' && Boolean(onSelectedDateRangeChange);

	//
	// B. Transform data

	const sourceEvents = useMemo(() => sources ? buildCalendarScheduleEvents(sources, timezone) : [], [sources, timezone]);
	const resolvedEvents = useMemo(() => [...sourceEvents, ...events].filter((event) => {
		if (!isCalendarSchedulePayload(event.payload)) return true;
		return eventTypeFilters?.[event.payload.type] ?? true;
	}), [eventTypeFilters, events, sourceEvents]);

	const affectedDates = useMemo(() => new Set(resolvedEvents.flatMap((event) => {
		if (!isCalendarSchedulePayload(event.payload) || event.payload.type !== 'rule-impact') return [];
		return [event.payload.sourceId];
	})), [resolvedEvents]);
	const addedDates = useMemo(() => new Set(dateChanges?.added ?? []), [dateChanges?.added]);
	const removedDates = useMemo(() => new Set(dateChanges?.removed ?? []), [dateChanges?.removed]);

	const highlightToday = affectedDates.size === 0;

	const yearWeekdayFormatter = useMemo(() => new Intl.DateTimeFormat(locale, {
		timeZone: 'UTC',
		weekday: 'narrow',
	}), [locale]);

	const monthPopover = useCalendarScheduleMonthPopover(resolvedEvents);

	const dateRangeSelection = useCalendarScheduleDateRange({
		enabled: isDateRangeSelectionEnabled,
		getDayProps: yearViewProps?.getDayProps,
		onChange: onSelectedDateRangeChange,
		onDayClick,
		value: selectedDateRange,
	});

	const renderMonthEvent = (event: ScheduleEventData, eventProps: MonthEventRenderProps) => {
		const runtimeProps = eventProps as MonthEventRenderProps & { mod?: ScheduleEventProps['mod'] };

		return (
			<ScheduleEvent
				className={styles.monthViewStaticEvent}
				event={event}
				mod={runtimeProps.mod}
				mode="static"
				renderEventBody={calendarEvent => <CalendarScheduleEvent event={calendarEvent} withTooltip={false} />}
				style={eventProps.style}
				aria-hidden
				autoSize
				nowrap
			/>
		);
	};

	const renderYearDay = (date: string, dayEvents: ScheduleEventData[]) => (
		<CalendarScheduleYearDay
			date={date}
			events={dayEvents}
			locale={locale}
			onEventClick={onEventClick}
		/>
	);

	const resolvedMonthViewProps: ScheduleProps['monthViewProps'] = {
		...monthViewProps,
		classNames: MONTH_VIEW_CLASS_NAMES,
		getDayProps: monthPopover.actions.getDayProps,
		highlightToday: monthViewProps?.highlightToday ?? highlightToday,
		maxEventsPerDay: monthViewProps?.maxEventsPerDay ?? 3,
		monthYearSelectProps: {
			...monthViewProps?.monthYearSelectProps,
			disabled: monthViewProps?.monthYearSelectProps?.disabled ?? true,
		},
		moreEventsProps: {
			...monthViewProps?.moreEventsProps,
			classNames: { moreEventsButton: styles.moreEventsButton },
			popoverProps: { disabled: true, withinPortal: true, ...monthViewProps?.moreEventsProps?.popoverProps },
		},
		renderEvent: renderMonthEvent,
		scrollAreaProps: {
			...monthViewProps?.scrollAreaProps,
			classNames: { content: styles.monthViewScrollContent },
			onScroll: (event) => {
				monthPopover.actions.setState(null);
				monthViewProps?.scrollAreaProps?.onScroll?.(event);
			},
		},
	};

	const resolvedYearViewProps: CalendarScheduleYearViewRuntimeProps = {
		...yearViewProps,
		classNames: YEAR_VIEW_CLASS_NAMES,
		getDayProps: (date) => {
			const calendarDate = toCalendarDate(date.slice(0, 10));
			const rangeDayProps = dateRangeSelection.getDayProps(date);
			const isRangeSelected = Boolean(rangeDayProps['data-range-selected']);
			const isRangeDateApplicable = dateRangeSelectionAction
				? (isDateRangeDateApplicable?.(calendarDate, dateRangeSelectionAction) ?? true)
				: false;

			return {
				...rangeDayProps,
				'data-affected': affectedDates.has(date) || undefined,
				'data-date-added': addedDates.has(calendarDate) || undefined,
				'data-date-removed': removedDates.has(calendarDate) || undefined,
				'data-range-action': isRangeSelected && isRangeDateApplicable ? dateRangeSelectionAction : undefined,
				'data-range-inapplicable': isRangeSelected && dateRangeSelectionAction && !isRangeDateApplicable ? true : undefined,
			};
		},
		highlightToday: yearViewProps?.highlightToday ?? highlightToday,
		mode,
		monthYearSelectProps: {
			...yearViewProps?.monthYearSelectProps,
			disabled: yearViewProps?.monthYearSelectProps?.disabled ?? true,
		},
		renderDay: renderYearDay,
		weekdayFormat: yearViewProps?.weekdayFormat ?? (value => yearWeekdayFormatter.format(
			new Date(`${value.slice(0, 10)}T00:00:00Z`),
		).toUpperCase()),
	};

	//
	// C. Handle actions

	const handleViewChange = (nextView: ScheduleViewLevel) => {
		monthPopover.actions.setState(null);
		dateRangeSelection.resetHover();
		setUncontrolledView(nextView);
		onViewChange?.(nextView);
	};

	//
	// D. Render components

	return (
		<div className={clsx(styles.container, className)}>
			{monthPopover.state && resolvedView === 'month' && (
				<CalendarScheduleMonthPopover
					locale={locale}
					onClose={monthPopover.actions.close}
					onDismiss={() => monthPopover.actions.setState(null)}
					onEventClick={onEventClick}
					onKeepOpen={monthPopover.actions.keepOpen}
					state={monthPopover.state}
				/>
			)}

			<Schedule
				{...props}
				className={styles.scheduleRoot}
				date={props.date}
				events={resolvedEvents}
				labels={{ ...DEFAULT_LABELS, ...labels }}
				locale={locale}
				mode={resolvedView === 'year' ? 'default' : mode}
				monthViewProps={resolvedMonthViewProps}
				onDayClick={dateRangeSelection.handleDayClick}
				onViewChange={handleViewChange}
				view={resolvedView}
				withEventResize={resolvedView === 'year' ? undefined : withEventResize}
				withEventsDragAndDrop={resolvedView === 'year' ? undefined : withEventsDragAndDrop}
				yearViewProps={resolvedYearViewProps}
			/>
		</div>
	);

	//
}

export type { CalendarScheduleDateRange } from './useCalendarScheduleDateRange';
