'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency, type Annotation, Event, Holiday, PermissionCatalog, type YearPeriod } from '@tmlmobilidade/types';
import { type CalendarScheduleEventType, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

interface AgencyScopedRecord {
	agency_ids?: string[]
}

function filterRecordsByAgency<T extends AgencyScopedRecord>(
	records: T[] | undefined,
	readableAgencyIds: Set<string>,
	selectedAgencyId: null | string,
): T[] {
	return (records ?? []).filter((record) => {
		if (selectedAgencyId) return readableAgencyIds.has(selectedAgencyId) && record.agency_ids?.includes(selectedAgencyId);
		return record.agency_ids?.some(agencyId => readableAgencyIds.has(agencyId));
	});
}

/* * */

export function useCalendarScheduleData(selectedAgencyId: null | string) {
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

	const agencyAccess = useMemo(() => {
		const canReadAgencyResource = (agencyId: string, scope: string, action: string) => {
			return meContext.actions.hasPermissionResource({
				action,
				resource_key: 'agency_ids',
				scope,
				value: agencyId,
			});
		};

		const createAccessSet = (scope: string, action: string) => new Set(
			(agencies.data ?? [])
				.filter(agency => canReadAgencyResource(agency._id, scope, action))
				.map(agency => agency._id),
		);

		return {
			annotations: createAccessSet(permissions.annotations.scope, permissions.annotations.actions.read),
			events: createAccessSet(permissions.events.scope, permissions.events.actions.read),
			holidays: createAccessSet(permissions.holidays.scope, permissions.holidays.actions.read),
			yearPeriods: createAccessSet(permissions.year_periods.scope, permissions.year_periods.actions.read),
		};
	}, [agencies.data, meContext.actions, permissions.annotations.actions.read, permissions.annotations.scope, permissions.events.actions.read, permissions.events.scope, permissions.holidays.actions.read, permissions.holidays.scope, permissions.year_periods.actions.read, permissions.year_periods.scope]);

	const filteredSources = useMemo(() => ({
		agencies: agencies.data ?? [],
		annotations: filterRecordsByAgency(annotations.data, agencyAccess.annotations, selectedAgencyId),
		events: filterRecordsByAgency(events.data, agencyAccess.events, selectedAgencyId),
		holidays: filterRecordsByAgency(holidays.data, agencyAccess.holidays, selectedAgencyId),
		yearPeriods: filterRecordsByAgency(yearPeriods.data, agencyAccess.yearPeriods, selectedAgencyId),
	}), [agencies.data, agencyAccess, annotations.data, events.data, holidays.data, selectedAgencyId, yearPeriods.data]);

	const counts = useMemo<Record<CalendarScheduleEventType, number>>(() => ({
		'annotation': filteredSources.annotations.length,
		'event': filteredSources.events.length,
		'holiday': filteredSources.holidays.length,
		'period': filteredSources.yearPeriods.length,
		'rule-impact': 0,
	}), [filteredSources]);

	const agencyOptions = useMemo(() => {
		const readableAgencyIds = new Set([
			...agencyAccess.annotations,
			...agencyAccess.events,
			...agencyAccess.holidays,
			...agencyAccess.yearPeriods,
		]);

		return (agencies.data ?? [])
			.filter(agency => readableAgencyIds.has(agency._id))
			.sort((a, b) => Number(a._id) - Number(b._id))
			.map(agency => ({
				label: `[${agency._id}] ${agency.code} - ${agency.name}`,
				value: agency._id,
			}));
	}, [agencies.data, agencyAccess]);

	return {
		agencyOptions,
		canShowPeriods: selectedAgencyId !== null && agencyAccess.yearPeriods.has(selectedAgencyId),
		counts,
		error: yearPeriods.error || annotations.error || holidays.error || events.error || agencies.error || null,
		isLoading: yearPeriods.isLoading || annotations.isLoading || holidays.isLoading || events.isLoading || agencies.isLoading,
		sources: filteredSources,
	};

	//
}
