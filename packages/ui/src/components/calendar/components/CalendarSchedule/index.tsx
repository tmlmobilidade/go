'use client';

import { UnstyledButton } from '@mantine/core';
import { type MonthViewProps, Schedule, type ScheduleEventData, type ScheduleProps, type ScheduleViewLevel } from '@mantine/schedule';
import { CalendarDate, toCalendarDate } from '@tmlmobilidade/go-types-shared';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { filterCalendarScheduleEventsForDate } from '../../utils/calendar-schedule-event-range';
import { buildCalendarScheduleEvents, type CalendarScheduleEventType, type CalendarScheduleSources, isCalendarSchedulePayload } from '../../utils/calendar-schedule-events';
import { CalendarScheduleEvent } from '../CalendarScheduleEvent';
import { CalendarScheduleMonthPopover } from '../CalendarScheduleMonthPopover';
import { CalendarScheduleYearDay } from '../CalendarScheduleYearDay';
import { type CalendarScheduleDateRange, useCalendarScheduleDateRange } from './useCalendarScheduleDateRange';
import { useCalendarScheduleMonthPopover } from './useCalendarScheduleMonthPopover';

/* * */

const EMPTY_EVENTS: ScheduleEventData[] = [];

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
	monthViewBackgroundEvent: styles.monthViewBackgroundEvent,
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
type CalendarScheduleMonthViewRuntimeProps = NonNullable<ScheduleProps['monthViewProps']> & Pick<ScheduleProps, 'renderEventBody'>;
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
	periodDisplay?: 'background' | 'default'
	selectedDateRange?: CalendarScheduleDateRange | null
	sources?: CalendarScheduleSources
	/** Show event-summary tooltips on year-view days. Defaults to true. */
	withDayTooltips?: boolean
	/** Faint period context in previews; none when the caller supplies its own day backgrounds. */
	yearPeriodDisplay?: 'background' | 'muted' | 'none'
	yearViewProps?: CalendarScheduleYearViewProps
}

/* * */

export function CalendarSchedule({ className, dateChanges, dateRangeSelectionAction, defaultView = 'month', events = EMPTY_EVENTS, eventTypeFilters, isDateRangeDateApplicable, labels, locale = 'pt', mode = 'default', monthViewProps, onDayClick, onEventClick, onSelectedDateRangeChange, onViewChange, periodDisplay = 'default', selectedDateRange, sources, view, withDayTooltips = true, withEventResize, withEventsDragAndDrop, withInteractiveBackgroundEvents, yearPeriodDisplay = 'background', yearViewProps, ...props }: CalendarScheduleProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [uncontrolledView, setUncontrolledView] = useState<ScheduleViewLevel>(defaultView);
	const resolvedView = view ?? uncontrolledView;
	const isDateRangeSelectionEnabled = resolvedView === 'year' && mode !== 'static' && Boolean(onSelectedDateRangeChange);

	//
	// B. Transform data

	const sourceEvents = useMemo(() => sources ? buildCalendarScheduleEvents(sources) : [], [sources]);
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

	const monthPopover = useCalendarScheduleMonthPopover(resolvedEvents, props.date);

	const dateRangeSelection = useCalendarScheduleDateRange({
		enabled: isDateRangeSelectionEnabled,
		getDayProps: yearViewProps?.getDayProps,
		onChange: onSelectedDateRangeChange,
		onDayClick,
		value: selectedDateRange,
	});

	const renderCalendarEventBody = (event: ScheduleEventData) => <CalendarScheduleEvent event={event} withTooltip={false} />;
	const renderMonthEvent = (event: ScheduleEventData, eventProps: MonthEventRenderProps) => {
		if (event.display === 'background' && (periodDisplay === 'background' || !withInteractiveBackgroundEvents)) {
			return (
				<UnstyledButton {...eventProps} tabIndex={-1} aria-hidden>
					<span className={styles.backgroundEventLabel}>{event.title}</span>
				</UnstyledButton>
			);
		}

		return <UnstyledButton {...eventProps} />;
	};
	const displayEvents = useMemo(() => resolvedView === 'month' && periodDisplay === 'background'
		? resolvedEvents.map(event => isCalendarSchedulePayload(event.payload) && event.payload.type === 'period' ? { ...event, display: 'background' as const } : event)
		: resolvedEvents, [resolvedEvents, resolvedView, periodDisplay]);

	const renderYearDay = (date: string, dayEvents: ScheduleEventData[]) => (
		<CalendarScheduleYearDay
			date={date}
			events={filterCalendarScheduleEventsForDate(dayEvents, date)}
			locale={locale}
			onEventClick={onEventClick}
			periodDisplay={yearPeriodDisplay}
			withTooltip={withDayTooltips}
		/>
	);

	const resolvedMonthViewProps: CalendarScheduleMonthViewRuntimeProps = {
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
		renderEventBody: renderCalendarEventBody,
		scrollAreaProps: {
			...monthViewProps?.scrollAreaProps,
			classNames: { content: styles.monthViewScrollContent },
			onScroll: (event) => {
				monthPopover.actions.dismiss();
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
		monthPopover.actions.dismiss();
		dateRangeSelection.resetHover();
		setUncontrolledView(nextView);
		onViewChange?.(nextView);
	};

	//
	// D. Render components

	return (
		<div {...(resolvedView === 'month' ? monthPopover.containerProps : {})} className={clsx(styles.container, className)}>
			{monthPopover.state && resolvedView === 'month' && (
				<CalendarScheduleMonthPopover
					locale={locale}
					onDismiss={monthPopover.actions.dismiss}
					onEventClick={onEventClick}
					onPointerEnter={monthPopover.actions.keepOpen}
					onPointerLeave={monthPopover.actions.scheduleClose}
					state={monthPopover.state}
				/>
			)}

			<Schedule
				{...props}
				className={styles.scheduleRoot}
				date={props.date}
				events={displayEvents}
				locale={locale}
				mode={resolvedView === 'year' ? 'default' : mode}
				monthViewProps={resolvedMonthViewProps}
				onDayClick={dateRangeSelection.handleDayClick}
				onViewChange={handleViewChange}
				view={resolvedView}
				withEventResize={resolvedView === 'year' ? undefined : withEventResize}
				withEventsDragAndDrop={resolvedView === 'year' ? undefined : withEventsDragAndDrop}
				withInteractiveBackgroundEvents={periodDisplay === 'background' ? false : withInteractiveBackgroundEvents}
				yearViewProps={resolvedYearViewProps}
				labels={{
					month: t('shared:components.calendar.month'),
					moreLabel: count => t('shared:components.calendar.more', '', { count }),
					next: t('shared:components.calendar.next'),
					previous: t('shared:components.calendar.previous'),
					selectMonth: t('shared:components.calendar.selectMonth'),
					selectYear: t('shared:components.calendar.selectYear'),
					switchToMonthView: t('shared:components.calendar.switchToMonthView'),
					switchToYearView: t('shared:components.calendar.switchToYearView'),
					today: t('shared:components.calendar.today'),
					viewSelectLabel: t('shared:components.calendar.viewSelectLabel'),
					year: t('shared:components.calendar.year'),
					...labels,
				}}
			/>
		</div>
	);

	//
}

export type { CalendarScheduleDateRange } from './useCalendarScheduleDateRange';
