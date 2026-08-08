'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/types';
import { ErrorDisplay, LoadingOverlay, Schedule, type ScheduleEventData, type ScheduleViewLevel, useTemporalSettingsContext } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import styles from './styles.module.css';

import { DatesScheduleEvent } from '../DatesScheduleEvent';
import { DatesScheduleFilters } from '../DatesScheduleFilters';
import { type DatesScheduleEventType, isDatesSchedulePayload } from './dates-schedule-events';
import { useDatesScheduleData } from './useDatesScheduleData';

/* * */

const INITIAL_FILTERS: Record<DatesScheduleEventType, boolean> = {
	annotation: true,
	event: true,
	holiday: true,
	period: true,
};

const SCHEDULE_LABELS = {
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

/* * */

export function DatesSchedule() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const temporalSettings = useTemporalSettingsContext();
	const [date, setDate] = useState<CalendarDate>(() => Dates.now(temporalSettings.timezone).calendar_date);
	const [view, setView] = useState<ScheduleViewLevel>('month');
	const [enabledTypes, setEnabledTypes] = useState(INITIAL_FILTERS);
	const scheduleData = useDatesScheduleData(temporalSettings.timezone);

	//
	// C. Transform data

	const visibleEvents = useMemo(() => {
		return scheduleData.events.filter(event => isDatesSchedulePayload(event.payload) && enabledTypes[event.payload.type]);
	}, [enabledTypes, scheduleData.events]);

	//
	// D. Handle actions

	const handleDateChange = (value: string) => setDate(toCalendarDate(value));

	const handleDayClick = (value: string) => {
		setDate(toCalendarDate(value));
		if (view === 'year') setView('month');
	};

	const handleViewChange = (value: ScheduleViewLevel) => {
		if (value === 'month' || value === 'year') setView(value);
	};

	const handleFilterToggle = (type: DatesScheduleEventType) => {
		setEnabledTypes(previous => ({ ...previous, [type]: !previous[type] }));
	};

	const handleEventClick = (event: ScheduleEventData) => {
		if (!isDatesSchedulePayload(event.payload)) return;

		if (event.payload.type === 'annotation') router.push(PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(event.payload.sourceId));
		if (event.payload.type === 'holiday') router.push(PAGE_ROUTES.dates.HOLIDAYS_DETAIL(event.payload.sourceId));
		if (event.payload.type === 'event') router.push(PAGE_ROUTES.dates.EVENTS_DETAIL(event.payload.sourceId));
	};

	//
	// E. Handle loading and error states

	if (scheduleData.isLoading) return <LoadingOverlay />;
	if (scheduleData.error) return <ErrorDisplay message="Não foi possível carregar os dados do calendário." />;

	//
	// F. Render components

	return (
		<div className={styles.root}>
			<DatesScheduleFilters
				counts={scheduleData.counts}
				enabledTypes={enabledTypes}
				onToggle={handleFilterToggle}
			/>

			<div className={styles.schedule}>
				<Schedule
					date={date}
					events={visibleEvents}
					labels={SCHEDULE_LABELS}
					locale={temporalSettings.locale}
					monthViewProps={{ maxEventsPerDay: 4, viewSelectProps: { views: ['month', 'year'] } }}
					onDateChange={handleDateChange}
					onDayClick={handleDayClick}
					onEventClick={handleEventClick}
					onViewChange={handleViewChange}
					renderEventBody={event => <DatesScheduleEvent event={event} />}
					view={view}
					yearViewProps={{ viewSelectProps: { views: ['month', 'year'] } }}
				/>
			</div>
		</div>
	);

	//
}
