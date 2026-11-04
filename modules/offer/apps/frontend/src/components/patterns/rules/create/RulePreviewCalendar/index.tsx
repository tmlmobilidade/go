'use client';

import { useAnnotationsContext } from '@/contexts/Annotations.context';
import { useEventsContext } from '@/contexts/Events.context';
import { useHolidaysContext } from '@/contexts/Holidays.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CalendarDate, type OperationalDateInt, toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { buildCalendarScheduleRuleImpactEvents, CalendarSchedule, type CalendarScheduleSources, isCalendarSchedulePayload, type ScheduleEventData, useLocaleContext } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

/* * */

export interface RulePreviewCalendarProps {
	affectedDates: CalendarDate[]
	onVisibleYearChange?: (year: number) => void
}

/* * */

export function RulePreviewCalendar({ affectedDates, onVisibleYearChange }: RulePreviewCalendarProps) {
	//

	//
	// A. Setup variables

	const localeContext = useLocaleContext();
	const annotationsContext = useAnnotationsContext();
	const eventsContext = useEventsContext();
	const holidaysContext = useHolidaysContext();
	const periodsContext = usePeriodsContext();
	const [visibleDate, setVisibleDate] = useState<CalendarDate>(() => Dates.now('local').calendar_date);

	//
	// B. Transform data

	const ruleImpactEvents = useMemo(
		() => buildCalendarScheduleRuleImpactEvents(affectedDates),
		[affectedDates],
	);

	const visibleYear = Number(visibleDate.slice(0, 4));
	const sources = useMemo<CalendarScheduleSources>(() => {
		// Providers already scope these sources to the pattern's agency.
		// Trim dates before event construction, including periods spanning years.
		const filterSourcesForYear = <T extends { dates?: OperationalDateInt[] }>(items: T[]): T[] => items.flatMap((item) => {
			const dates = (item.dates ?? []).filter(date => date >= visibleYear * 10_000 + 101 && date <= visibleYear * 10_000 + 1231);
			return dates.length > 0 ? [{ ...item, dates }] : [];
		});

		return {
			annotations: filterSourcesForYear(annotationsContext.data.raw),
			events: filterSourcesForYear(eventsContext.data.raw),
			holidays: filterSourcesForYear(holidaysContext.data.raw),
			yearPeriods: filterSourcesForYear(periodsContext.data.raw),
		};
	}, [annotationsContext.data.raw, eventsContext.data.raw, holidaysContext.data.raw, periodsContext.data.raw, visibleYear]);

	//
	// C. Handle actions

	const handleVisibleDateChange = (value: string) => {
		const date = toCalendarDate(value.slice(0, 10));
		setVisibleDate(date);
		onVisibleYearChange?.(Number(date.slice(0, 4)));
	};

	const handleEventClick = (event: ScheduleEventData) => {
		if (!isCalendarSchedulePayload(event.payload)) return;

		let route: string | undefined;

		if (event.payload.type === 'annotation') route = PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(event.payload.sourceId);
		if (event.payload.type === 'holiday') route = PAGE_ROUTES.dates.HOLIDAYS_DETAIL(event.payload.sourceId);
		if (event.payload.type === 'event') route = PAGE_ROUTES.offer.EVENTS_DETAIL(event.payload.sourceId);
		if (event.payload.type === 'period') route = PAGE_ROUTES.offer.YEAR_PERIODS_DETAIL(event.payload.sourceId);

		if (route) window.open(route, '_blank', 'noopener,noreferrer');
	};

	//
	// D. Render components

	return (
		<CalendarSchedule
			date={visibleDate}
			events={ruleImpactEvents}
			locale={localeContext.data.locale}
			mode="static"
			onDateChange={handleVisibleDateChange}
			onEventClick={handleEventClick}
			sources={sources}
			view="year"
			yearPeriodDisplay="muted"
			yearViewProps={{ viewSelectProps: { views: ['year'] } }}
		/>
	);

	//
}
