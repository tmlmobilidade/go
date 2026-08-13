'use client';

import { useCalendarDayCounterContext } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { buildCalendarScheduleRuleImpactEvents, CalendarSchedule, isCalendarSchedulePayload, type ScheduleEventData, Surface, useLocaleContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function CalendarDayCounterPreview() {
	//

	//
	// A. Setup variables

	const dayCounterContext = useCalendarDayCounterContext();
	const localeContext = useLocaleContext();

	//
	// B. Transform data

	const ruleImpactEvents = useMemo(
		() => buildCalendarScheduleRuleImpactEvents(dayCounterContext.data.ruleImpact.dates),
		[dayCounterContext.data.ruleImpact.dates],
	);

	//
	// C. Handle actions

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
		<section className={styles.root}>
			<Surface className={styles.calendar} height="full" variant="plain">
				<CalendarSchedule
					date={dayCounterContext.filters.visibleDate}
					events={ruleImpactEvents}
					locale={localeContext.data.locale}
					mode="static"
					onDateChange={dayCounterContext.actions.setVisibleDate}
					onEventClick={handleEventClick}
					sources={dayCounterContext.data.sources}
					view="year"
					yearViewProps={{ highlightToday: false, viewSelectProps: { views: ['year'] } }}
				/>
			</Surface>
		</section>
	);

	//
}
