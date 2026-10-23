'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency } from '@tmlmobilidade/go-types-core';
import { type Annotation, type Holiday } from '@tmlmobilidade/go-types-dates';
import { type Event, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { filterPermissionResourceValues, hasPermission, type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useMeData } from '../../../auth';
import { fetchApiData } from '../../../fetch';
import { toAgencySelectItem } from '../../../filters/list/to-agency-select-item';
import { type CalendarScheduleEventType, type CalendarScheduleSources } from '../utils/calendar-schedule-events';

/* * */

const CALENDAR_SCOPES = PermissionCatalog.all;

type CalendarAgency = Pick<Agency, '_id' | 'code' | 'name' | 'short_name'>;

interface UseCalendarScheduleDataReturnType {
	agencyOptions: { label: string, value: string }[]
	canShowPeriods: boolean
	counts: Record<CalendarScheduleEventType, number>
	error: Error | null
	isLoading: boolean
	sources: Required<CalendarScheduleSources>
}

/* * */

function useCalendarSource<T>(url: null | string) {
	return useSWR<ApiResponse<T[]>>(url, { fetcher: async (endpoint: string) => await fetchApiData<T[]>({ url: endpoint }) });
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
	// B. Fetch data and the matching agency lookups

	const yearPeriods = useCalendarSource<YearPeriod>(canReadPeriods ? API_ROUTES.offer.YEAR_PERIODS_LIST : null);
	const annotations = useCalendarSource<Annotation>(canReadAnnotations ? API_ROUTES.dates.ANNOTATIONS_LIST : null);
	const holidays = useCalendarSource<Holiday>(canReadHolidays ? API_ROUTES.dates.HOLIDAYS_LIST : null);
	const events = useCalendarSource<Event>(canReadEvents ? API_ROUTES.offer.EVENTS_LIST : null);
	const agencyUrls = [
		canReadPeriods ? API_ROUTES.offer.YEAR_PERIODS_LIST_AGENCIES : null,
		canReadAnnotations ? API_ROUTES.dates.ANNOTATIONS_LIST_AGENCIES : null,
		canReadHolidays ? API_ROUTES.dates.HOLIDAYS_LIST_AGENCIES : null,
		canReadEvents ? API_ROUTES.offer.EVENTS_LIST_AGENCIES : null,
	].filter(url => url !== null);
	const agencies = useSWR<CalendarAgency[]>(agencyUrls.length ? ['calendar-agencies', ...agencyUrls] : null, {
		fetcher: async ([, ...urls]: string[]) => {
			const responses = await Promise.all(urls.map(async url => await fetchApiData<CalendarAgency[]>({ url })));
			const error = responses.find(response => response.error)?.error;
			if (error) throw new Error(error);
			return [...new Map(responses.flatMap(response => response.data ?? []).map(agency => [agency._id, agency])).values()];
		},
	});

	//
	// C. Transform data

	const transformed = useMemo(() => {
		const availableAgencies = agencies.data ?? [];
		const accessibleIds = (scope: Permission['scope']) => new Set(filterPermissionResourceValues({
			action: 'read', permissions: me?.permissions ?? [], resourceKey: 'agency_ids', scope, values: availableAgencies.map(agency => agency._id),
		}));
		const periodAgencyIds = accessibleIds(scopes.year_periods.scope);
		const filterRecords = <T extends { agency_ids?: string[] }>(records: T[] | undefined, scope: Permission['scope']): T[] => {
			const allowed = accessibleIds(scope);
			return (records ?? []).filter(record => selectedAgencyId
				? allowed.has(selectedAgencyId) && record.agency_ids?.includes(selectedAgencyId)
				: record.agency_ids?.some(id => allowed.has(id)));
		};
		const sources = {
			agencies: availableAgencies,
			annotations: filterRecords(annotations.data?.data, scopes.annotations.scope),
			events: filterRecords(events.data?.data, scopes.events.scope),
			holidays: filterRecords(holidays.data?.data, scopes.holidays.scope),
			yearPeriods: filterRecords(yearPeriods.data?.data, scopes.year_periods.scope),
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
		const canShowPeriods = selectedAgencyId !== null && periodAgencyIds.has(selectedAgencyId);
		return { agencyOptions, canShowPeriods, counts, sources };
	}, [agencies.data, annotations.data?.data, events.data?.data, holidays.data?.data, yearPeriods.data?.data, me?.permissions, selectedAgencyId, scopes]);

	const responses = [yearPeriods, annotations, holidays, events];
	const message = meError ?? responses.map(response => response.data?.error ?? response.error?.message).find(Boolean) ?? agencies.error?.message;
	const error = message ? new Error(message) : null;
	const isLoading = meLoading || agencies.isLoading || responses.some(response => response.isLoading);

	//
	// D. Return data

	return useMemo(() => ({ ...transformed, error, isLoading }), [transformed, error, isLoading]);
}
