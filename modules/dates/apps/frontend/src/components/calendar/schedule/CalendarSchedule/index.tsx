'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/types';
import { type CalendarScheduleEventType, ErrorDisplay, isCalendarSchedulePayload, LoadingOverlay, type ScheduleEventData, type ScheduleViewLevel, CalendarSchedule as UICalendarSchedule, useLocaleContext, useQueryState } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';

import styles from './styles.module.css';

import { CalendarScheduleSidebar } from '../CalendarScheduleSidebar';
import { useCalendarScheduleData } from '../useCalendarScheduleData';

/* * */

const INITIAL_FILTERS: Record<CalendarScheduleEventType, boolean> = {
	'annotation': true,
	'event': true,
	'holiday': true,
	'period': true,
	'rule-impact': true,
};

/* * */

export function CalendarSchedule() {
	//

	//
	// A. Setup variables

	const localeContext = useLocaleContext();
	const today = Dates.now('local').calendar_date;
	const [date, setDate] = useState<CalendarDate>(today);
	const [view, setView] = useState<ScheduleViewLevel>('month');
	const [enabledTypes, setEnabledTypes] = useState(INITIAL_FILTERS);
	const [selectedAgencyId, setSelectedAgencyId] = useQueryState('agency');
	const scheduleData = useCalendarScheduleData(selectedAgencyId);

	//
	// B. Transform data

	const eventTypeFilters = useMemo(() => ({
		...enabledTypes,
		period: enabledTypes.period && scheduleData.canShowPeriods,
	}), [enabledTypes, scheduleData.canShowPeriods]);

	//
	// C. Handle actions

	const handleDateChange = (value: string) => {
		setDate(toCalendarDate(value.slice(0, 10)));
	};

	const handleDayClick = (value: string) => {
		if (view !== 'year') return;

		setDate(toCalendarDate(value));
		setView('month');
	};

	const handleViewChange = (value: ScheduleViewLevel) => {
		if (value === 'month' || value === 'year') setView(value);
	};

	const handleFilterToggle = (type: CalendarScheduleEventType) => {
		setEnabledTypes(previous => ({ ...previous, [type]: !previous[type] }));
	};

	const handleAgencyChange = (agencyId: null | string) => {
		void setSelectedAgencyId(agencyId);
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

	useEffect(() => {
		if (scheduleData.isLoading || !selectedAgencyId) return;
		if (scheduleData.agencyOptions.some(option => option.value === selectedAgencyId)) return;
		void setSelectedAgencyId(null);
	}, [scheduleData.agencyOptions, scheduleData.isLoading, selectedAgencyId, setSelectedAgencyId]);

	//
	// D. Handle loading and error states

	if (scheduleData.isLoading) return <LoadingOverlay />;
	if (scheduleData.error) return <ErrorDisplay message="Não foi possível carregar os dados do calendário." />;

	//
	// E. Render components

	return (
		<div className={styles.root}>
			<CalendarScheduleSidebar
				agencyOptions={scheduleData.agencyOptions}
				canShowPeriods={scheduleData.canShowPeriods}
				counts={scheduleData.counts}
				date={date}
				enabledTypes={enabledTypes}
				locale={localeContext.data.locale}
				onAgencyChange={handleAgencyChange}
				onDateChange={handleDateChange}
				onToggle={handleFilterToggle}
				selectedAgencyId={selectedAgencyId}
			/>

			<div className={styles.schedule}>
				<UICalendarSchedule
					date={date}
					eventTypeFilters={eventTypeFilters}
					locale={localeContext.data.locale}
					monthViewProps={{ viewSelectProps: { views: ['month', 'year'] } }}
					onDateChange={handleDateChange}
					onDayClick={handleDayClick}
					onEventClick={handleEventClick}
					onViewChange={handleViewChange}
					sources={scheduleData.sources}
					view={view}
					yearViewProps={{ viewSelectProps: { views: ['month', 'year'] } }}
				/>
			</div>
		</div>
	);

	//
}
