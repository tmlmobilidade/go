'use client';

import { useAnnotationsContext } from '@/contexts/Annotations.context';
import { useEventsContext } from '@/contexts/Events.context';
import { useHolidaysContext } from '@/contexts/Holidays.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates, type TimezoneIdentified } from '@tmlmobilidade/dates';
import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/types';
import { buildCalendarScheduleRuleImpactEvents, CalendarSchedule, type CalendarScheduleSources, isCalendarSchedulePayload, type ScheduleEventData, useTemporalSettingsContext } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

/* * */

export interface RulePreviewCalendarProps {
	affectedDates: CalendarDate[]
	onVisibleYearChange?: (year: number) => void
	timezone?: TimezoneIdentified
}

/* * */

export function RulePreviewCalendar({ affectedDates, onVisibleYearChange, timezone }: RulePreviewCalendarProps) {
	//

	//
	// A. Setup variables

	const temporalSettings = useTemporalSettingsContext();
	const annotationsContext = useAnnotationsContext();
	const eventsContext = useEventsContext();
	const holidaysContext = useHolidaysContext();
	const periodsContext = usePeriodsContext();
	const resolvedTimezone = timezone ?? temporalSettings.timezone;
	const [visibleDate, setVisibleDate] = useState<CalendarDate>(() => Dates.now(resolvedTimezone).calendar_date);

	//
	// B. Transform data

	const ruleImpactEvents = useMemo(
		() => buildCalendarScheduleRuleImpactEvents(affectedDates, resolvedTimezone),
		[affectedDates, resolvedTimezone],
	);

	const sources = useMemo<CalendarScheduleSources>(() => ({
		annotations: annotationsContext.data.raw,
		events: eventsContext.data.raw,
		holidays: holidaysContext.data.raw,
		yearPeriods: periodsContext.data.raw,
	}), [annotationsContext.data.raw, eventsContext.data.raw, holidaysContext.data.raw, periodsContext.data.raw]);

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
		if (event.payload.type === 'event') route = PAGE_ROUTES.dates.EVENTS_DETAIL(event.payload.sourceId);
		if (event.payload.type === 'period') route = PAGE_ROUTES.dates.YEAR_PERIODS_DETAIL(event.payload.sourceId);

		if (route) window.open(route, '_blank', 'noopener,noreferrer');
	};

	//
	// D. Render components

	return (
		<CalendarSchedule
			date={visibleDate}
			events={ruleImpactEvents}
			locale={temporalSettings.locale}
			mode="static"
			onDateChange={handleVisibleDateChange}
			onEventClick={handleEventClick}
			sources={sources}
			timezone={resolvedTimezone}
			view="year"
			yearViewProps={{ viewSelectProps: { views: ['year'] } }}
		/>
	);

	//
}
