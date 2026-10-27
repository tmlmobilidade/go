'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation, type Holiday } from '@tmlmobilidade/go-types-dates';
import { type Event, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { filterPermissionResourceValues, hasPermission, type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useMeData } from '../../../auth';
import { fetchApiData } from '../../../fetch';
import { toAgencySelectItem } from '../../../filters/list/to-agency-select-item';
import { useAgenciesData } from '../../../hooks/use-data/use-agencies-data';
import { type CalendarScheduleEventType, type CalendarScheduleSources } from '../utils/calendar-schedule-events';

/* * */

const CALENDAR_SCOPES = PermissionCatalog.all;

interface UseCalendarScheduleDataReturnType {
	agencyOptions: { label: string, value: string }[]
	canShowPeriods: boolean
	counts: Record<CalendarScheduleEventType, number>
	error: Error | null
	hasAgenciesData: boolean
	isLoading: boolean
	sources: Required<CalendarScheduleSources>
}

/* * */

function useCalendarSource<T>(url: null | string) {
	return useSWR<ApiResponse<T[]>>(url, { fetcher: async (endpoint: string) => await fetchApiData<T[]>({ url: endpoint }), shouldRetryOnError: false });
}

/** Fetch calendar sources from their owning APIs, narrowed by entity permissions. */
export function useCalendarScheduleData(selectedAgencyId: null | string): UseCalendarScheduleDataReturnType {
	//

	//
	// A. Setup variables

	const { data: me, error: meError, isLoading: meLoading } = useMeData();
	const scopes = CALENDAR_SCOPES;
	const canRead = (scope: Permission['scope']) => hasPermission(me?.permissions ?? [], { action: 'read', scope });
	const canReadPeriods = canRead(scopes.year_periods.scope);
	const canReadAnnotations = canRead(scopes.annotations.scope);
	const canReadHolidays = canRead(scopes.holidays.scope);
	const canReadEvents = canRead(scopes.events.scope);

	//
	// B. Fetch independent sources and the shared Core agency lookup

	const yearPeriods = useCalendarSource<YearPeriod>(canReadPeriods ? API_ROUTES.offer.YEAR_PERIODS_LIST : null);
	const annotations = useCalendarSource<Annotation>(canReadAnnotations ? API_ROUTES.dates.ANNOTATIONS_LIST : null);
	const holidays = useCalendarSource<Holiday>(canReadHolidays ? API_ROUTES.dates.HOLIDAYS_LIST : null);
	const events = useCalendarSource<Event>(canReadEvents ? API_ROUTES.offer.EVENTS_LIST : null);
	const agencies = useAgenciesData({ enabled: !!me });

	//
	// C. Transform data

	const transformed = useMemo(() => {
		const availableAgencies = agencies.data;
		const accessibleIds = (scope: Permission['scope']) => new Set(filterPermissionResourceValues({
			action: 'read', permissions: me?.permissions ?? [], resourceKey: 'agency_ids', scope, values: availableAgencies.map(agency => agency._id),
		}));
		const periodAgencyIds = new Set(filterPermissionResourceValues({
			action: 'read', permissions: me?.permissions ?? [], resourceKey: 'agency_ids', scope: scopes.year_periods.scope, values: selectedAgencyId ? [selectedAgencyId] : [],
		}));
		const filterRecords = <T extends { agency_ids?: string[] }>(records: T[] | undefined, scope: Permission['scope']): T[] => {
			// Filtering must not depend on the optional agency-label lookup.
			const allowed = new Set(filterPermissionResourceValues({
				action: 'read', permissions: me?.permissions ?? [], resourceKey: 'agency_ids', scope, values: [...new Set((records ?? []).flatMap(record => record.agency_ids ?? []))],
			}));
			return (records ?? []).filter(record => selectedAgencyId
				? allowed.has(selectedAgencyId) && record.agency_ids?.includes(selectedAgencyId)
				: record.agency_ids?.some(id => allowed.has(id)));
		};
		const sources = {
			agencies: availableAgencies,
			annotations: filterRecords(annotations.error || annotations.data?.error ? undefined : annotations.data?.data, scopes.annotations.scope),
			events: filterRecords(events.error || events.data?.error ? undefined : events.data?.data, scopes.events.scope),
			holidays: filterRecords(holidays.error || holidays.data?.error ? undefined : holidays.data?.data, scopes.holidays.scope),
			yearPeriods: filterRecords(yearPeriods.error || yearPeriods.data?.error ? undefined : yearPeriods.data?.data, scopes.year_periods.scope),
		};
		const counts: Record<CalendarScheduleEventType, number> = {
			'annotation': sources.annotations.length,
			'event': sources.events.length,
			'holiday': sources.holidays.length,
			'period': sources.yearPeriods.length,
			'rule-impact': 0,
		};
		const readableIds = new Set([scopes.year_periods.scope, scopes.annotations.scope, scopes.holidays.scope, scopes.events.scope].flatMap(scope => [...accessibleIds(scope)]));
		const agencyOptions = availableAgencies.filter(agency => readableIds.has(agency._id)).map(toAgencySelectItem);
		const canShowPeriods = selectedAgencyId !== null && periodAgencyIds.has(selectedAgencyId) && !!yearPeriods.data?.data && !yearPeriods.error && !yearPeriods.data.error;
		return { agencyOptions, canShowPeriods, counts, sources };
	}, [agencies.data, annotations.data?.data, events.data?.data, holidays.data?.data, yearPeriods.data?.data, annotations.data?.error, events.data?.error, holidays.data?.error, yearPeriods.data?.error, annotations.error, events.error, holidays.error, yearPeriods.error, me?.permissions, selectedAgencyId, scopes]);

	// Calendar sources are optional: one unavailable module must not block the rest.
	const error = meError ? new Error(meError) : null;
	const isLoading = meLoading;
	const hasAgenciesData = !agencies.error && agencies.timestamp !== null;

	//
	// D. Return data

	return useMemo(() => ({ ...transformed, error, hasAgenciesData, isLoading }), [transformed, error, hasAgenciesData, isLoading]);
}
