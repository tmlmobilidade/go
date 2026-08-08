'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type TimezoneIdentified } from '@tmlmobilidade/dates';
import { type Agency, type Annotation, Event, Holiday, PermissionCatalog, type YearPeriod } from '@tmlmobilidade/types';
import { useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { buildDatesScheduleEvents, type DatesScheduleEventType } from './dates-schedule-events';

/* * */

export function useDatesScheduleData(timezone: TimezoneIdentified) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const permissions = PermissionCatalog.all;

	const canReadYearPeriods = meContext.actions.hasPermission(permissions.year_periods.scope, permissions.year_periods.actions.read);
	const canReadAnnotations = meContext.actions.hasPermission(permissions.annotations.scope, permissions.annotations.actions.read);
	const canReadHolidays = meContext.actions.hasPermission(permissions.holidays.scope, permissions.holidays.actions.read);
	const canReadEvents = meContext.actions.hasPermission(permissions.events.scope, permissions.events.actions.read);

	//
	// B. Fetch data

	const yearPeriods = useSWR<YearPeriod[]>(canReadYearPeriods ? API_ROUTES.dates.YEAR_PERIODS_LIST : null);
	const annotations = useSWR<Annotation[]>(canReadAnnotations ? API_ROUTES.dates.ANNOTATIONS_LIST : null);
	const holidays = useSWR<Holiday[]>(canReadHolidays ? API_ROUTES.dates.HOLIDAYS_LIST : null);
	const events = useSWR<Event[]>(canReadEvents ? API_ROUTES.dates.EVENTS_LIST : null);
	const agencies = useSWR<Agency[]>(API_ROUTES.auth.AGENCIES_LIST);

	//
	// C. Transform data

	const scheduleEvents = useMemo(() => buildDatesScheduleEvents({
		agencies: agencies.data ?? [],
		annotations: annotations.data ?? [],
		events: events.data ?? [],
		holidays: holidays.data ?? [],
		yearPeriods: yearPeriods.data ?? [],
	}, timezone), [agencies.data, annotations.data, events.data, holidays.data, timezone, yearPeriods.data]);

	const counts = useMemo<Record<DatesScheduleEventType, number>>(() => ({
		annotation: annotations.data?.length ?? 0,
		event: events.data?.length ?? 0,
		holiday: holidays.data?.length ?? 0,
		period: yearPeriods.data?.length ?? 0,
	}), [annotations.data, events.data, holidays.data, yearPeriods.data]);

	return {
		counts,
		error: yearPeriods.error || annotations.error || holidays.error || events.error || null,
		events: scheduleEvents,
		isLoading: yearPeriods.isLoading || annotations.isLoading || holidays.isLoading || events.isLoading,
	};

	//
}
