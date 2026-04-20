'use client';

/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { AlertNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { normalizeString } from '@tmlmobilidade/strings';
import { type Alert, AlertSchema, type UnixTimestamp } from '@tmlmobilidade/types';
import { useAgenciesContext, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { parseAsBoolean, parseAsInteger, useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/* * */

interface AlertsPublicListContextState {
	data: {
		filtered: Alert[]
		raw: Alert[]
	}
	filters: {
		agency: UseFilterStateListReturnType
		cause: UseFilterStateListReturnType
		effect: UseFilterStateListReturnType
		include_past_alerts: boolean
		line: UseFilterStateListReturnType
		period_default_since: UnixTimestamp
		period_default_until: UnixTimestamp
		period_since: UnixTimestamp
		period_until: UnixTimestamp
		search: UseFilterStateStringReturnType
		setIncludePastAlerts: (value: boolean) => void
		setPeriodSince: (value: null | UnixTimestamp) => void
		setPeriodUntil: (value: null | UnixTimestamp) => void
		stop: UseFilterStateListReturnType
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const AlertsPublicListContext = createContext<AlertsPublicListContextState | undefined>(undefined);

export const useAlertsPublicListContext = () => {
	const context = useContext(AlertsPublicListContext);
	if (!context) {
		throw new Error('useAlertsPublicListContext must be used within an AlertsPublicListContextProvider');
	}
	return context;
};

/* * */

interface StopWithLines {
	id: string
	line_ids?: string[]
}

export const AlertsPublicListContextProvider = ({ children }: PropsWithChildren) => {
	const { t } = useTranslation();
	const agenciesContext = useAgenciesContext();
	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();

	const { data: allScheduledData, error: allScheduledError, isLoading: allScheduledLoading } = useSWR<Alert[], Error>(API_ROUTES.alerts.ALERTS_PUBLIC);

	const filterSearch = useFilterStateString('search');
	const [includePastAlerts, setIncludePastAlertsParam] = useQueryState('past_alerts', parseAsBoolean.withDefault(false));

	const [defaultPeriodSince, defaultPeriodUntil] = useMemo(() => {
		const startOfToday = Dates.now('Europe/Lisbon').startOf('day');
		return [startOfToday.unix_timestamp, startOfToday.plus({ days: 7 }).endOf('day').unix_timestamp] as const;
	}, []);

	const [periodSince, setPeriodSinceParam] = useQueryState(
		'since',
		parseAsInteger.withDefault(defaultPeriodSince),
	);
	const [periodUntil, setPeriodUntilParam] = useQueryState(
		'until',
		parseAsInteger.withDefault(defaultPeriodUntil),
	);

	const stopsById = useMemo(() => {
		const list = stopsContext.data.raw;
		return new Map(list.map(s => [s._id, s]));
	}, [stopsContext.data.raw]);

	const lineIdsInAlerts = useMemo(() => {
		const set = new Set<string>();
		if (!allScheduledData) return [];
		for (const alert of allScheduledData) {
			if (alert.reference_type === 'lines') {
				for (const r of alert.references) set.add(r.parent_id);
			}
			if (alert.reference_type === 'stops') {
				for (const r of alert.references) {
					const stop = stopsById.get(r.parent_id);
					for (const lid of (stop as unknown as StopWithLines)?.line_ids ?? []) set.add(lid);
				}
			}
		}
		return [...set].sort();
	}, [allScheduledData, stopsById]);

	const stopIdsInAlerts = useMemo(() => {
		const set = new Set<string>();
		if (!allScheduledData) return [];
		for (const alert of allScheduledData) {
			if (alert.reference_type === 'stops') {
				for (const r of alert.references) set.add(r.parent_id);
			}
			if (alert.reference_type === 'lines') {
				for (const r of alert.references) {
					for (const c of r.child_ids) set.add(c);
				}
			}
		}
		return [...set].sort();
	}, [allScheduledData]);

	const lineFilterOptions = useMemo(() => {
		if (!lineIdsInAlerts.length) return [];
		const idSet = new Set(lineIdsInAlerts.map(String));
		const fromCatalog = linesContext.data.options.filter(o => idSet.has(String(o.value)));
		const covered = new Set(fromCatalog.map(o => String(o.value)));
		const fallbacks = lineIdsInAlerts
			.filter(id => !covered.has(String(id)))
			.map(id => ({ label: String(id), value: String(id) }));
		return [...fromCatalog, ...fallbacks].sort((a, b) => String(a.label).localeCompare(String(b.label), 'pt', { numeric: true }));
	}, [linesContext.data.options, lineIdsInAlerts]);

	const stopFilterOptions = useMemo(() => {
		if (!stopIdsInAlerts.length) return [];
		const ids = new Set(stopIdsInAlerts);
		return stopsContext.data.options
			.filter(o => ids.has(String(o.value)))
			.sort((a, b) => String(a.label).localeCompare(String(b.label), 'pt'));
	}, [stopsContext.data.options, stopIdsInAlerts]);

	const agencyIdsInAlerts = useMemo(() => {
		if (!allScheduledData) return [];
		return [...new Set(allScheduledData.map(item => item.agency_id))].sort();
	}, [allScheduledData]);

	const agencyFilterOptions = useMemo(() => {
		if (!agencyIdsInAlerts.length) return [];
		const idSet = new Set(agencyIdsInAlerts.map(String));
		const fromApi = agenciesContext.data.as_options.filter(option => idSet.has(String(option.value)));
		const covered = new Set(fromApi.map(o => String(o.value)));
		const fallbacks = agencyIdsInAlerts
			.filter(id => !covered.has(String(id)))
			.map(id => ({ label: String(id), value: String(id) }));
		return [...fromApi, ...fallbacks].sort((a, b) => Number(a.value) - Number(b.value) || String(a.value).localeCompare(String(b.value), 'pt'));
	}, [agencyIdsInAlerts, agenciesContext.data.as_options]);

	const filterAgency = useFilterStateList('agency', agencyIdsInAlerts, agencyFilterOptions);
	const filterCause = useFilterStateList('cause', AlertSchema.shape.cause.options, AlertSchema.shape.cause.options.map(item => ({ label: t(`shared:alerts.causes.${item}.title`), value: item })));
	const filterEffect = useFilterStateList('effect', AlertSchema.shape.effect.options, AlertSchema.shape.effect.options.map(item => ({ label: t(`shared:alerts.effects.${item}.title`), value: item })));

	const filterLine = useFilterStateList('line', lineIdsInAlerts, lineFilterOptions);
	const filterStop = useFilterStateList('stop', stopIdsInAlerts, stopFilterOptions);

	const normalizedAlertsData: AlertNormalized[] = useMemo(() => {
		if (!allScheduledData) return [];
		return allScheduledData.map(item => ({
			...item,
			description_normalized: normalizeString(item.description),
			title_normalized: normalizeString(item.title),
		}));
	}, [allScheduledData]);

	const searchResultsData = useSearch<AlertNormalized>({
		accessors: ['_id', 'title_normalized', 'description_normalized'],
		data: normalizedAlertsData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		if (!searchResultsData) return [];

		const startOfTodayLisbon = Dates.now('Europe/Lisbon').startOf('day').unix_timestamp;

		const passesActivePeriodWindow = (alert: AlertNormalized): boolean => {
			let windowStart = periodSince ?? defaultPeriodSince;
			let windowEnd = periodUntil ?? defaultPeriodUntil;
			if (windowStart > windowEnd) [windowStart, windowEnd] = [windowEnd, windowStart];
			const alertStart = alert.active_period_start_date;
			const alertEnd = alert.active_period_end_date ?? Number.MAX_SAFE_INTEGER;
			return alertStart <= windowEnd && alertEnd >= windowStart;
		};

		const passesLine = (alert: AlertNormalized): boolean => {
			if (lineIdsInAlerts.length === 0) return true;
			if (!filterLine.isActive) return true;
			const selected = new Set(filterLine.value);
			if (alert.reference_type === 'lines') {
				return alert.references.some(r => selected.has(r.parent_id));
			}
			// if (alert.reference_type === 'stops') {
			// 	return alert.references.some((r) => {
			// 		const stop = stopsById.get(r.parent_id);
			// 		return stop?.line_ids?.some(lid => selected.has(lid)) ?? false;
			// 	});
			// }
			return false;
		};

		const passesStop = (alert: AlertNormalized): boolean => {
			if (stopIdsInAlerts.length === 0) return true;
			if (!filterStop.isActive) return true;
			const selected = new Set(filterStop.value);
			if (alert.reference_type === 'stops') {
				return alert.references.some(r => selected.has(r.parent_id));
			}
			if (alert.reference_type === 'lines') {
				return alert.references.some(r => r.child_ids.some(c => selected.has(c)));
			}
			return false;
		};

		const result = searchResultsData.filter((alert: AlertNormalized) => {
			if (!includePastAlerts) {
				const alertDayStart = Dates
					.fromUnixTimestamp(alert.active_period_start_date)
					.setZone('Europe/Lisbon', 'offset_only')
					.startOf('day')
					.unix_timestamp;
				if (alertDayStart < startOfTodayLisbon) return false;
			}
			if (!passesActivePeriodWindow(alert)) return false;
			if (agencyIdsInAlerts.length > 0 && !filterAgency.value.includes(alert.agency_id)) return false;
			if (!passesLine(alert) || !passesStop(alert)) return false;
			if (!filterCause.value.includes(alert.cause)) return false;
			if (!filterEffect.value.includes(alert.effect)) return false;
			return true;
		});

		return result.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
	}, [searchResultsData, filterLine.isActive, filterLine.value, filterStop.isActive, filterStop.value, filterAgency.value, filterCause.value, filterEffect.value, agencyIdsInAlerts.length, lineIdsInAlerts.length, stopIdsInAlerts.length, includePastAlerts, defaultPeriodSince, defaultPeriodUntil, periodSince, periodUntil]);

	const contextValue: AlertsPublicListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData ?? [],
			raw: allScheduledData,
		},
		filters: {
			agency: filterAgency,
			cause: filterCause,
			effect: filterEffect,
			include_past_alerts: includePastAlerts,
			line: filterLine,
			period_default_since: defaultPeriodSince as UnixTimestamp,
			period_default_until: defaultPeriodUntil as UnixTimestamp,
			period_since: (periodSince ?? defaultPeriodSince) as UnixTimestamp,
			period_until: (periodUntil ?? defaultPeriodUntil) as UnixTimestamp,
			search: filterSearch,
			setIncludePastAlerts: (value: boolean) => {
				void setIncludePastAlertsParam(value ? true : null);
			},
			setPeriodSince: (value: null | UnixTimestamp) => {
				void setPeriodSinceParam(value as null | number);
			},
			setPeriodUntil: (value: null | UnixTimestamp) => {
				void setPeriodUntilParam(value as null | number);
			},
			stop: filterStop,
		},
		flags: {
			error: allScheduledError,
			loading: allScheduledLoading,
		},
	}), [
		allScheduledData,
		filterResultsData,
		allScheduledLoading,
		filterAgency,
		filterCause,
		filterEffect,
		filterLine,
		filterSearch,
		filterStop,
		allScheduledError,
		includePastAlerts,
		setIncludePastAlertsParam,
		defaultPeriodSince,
		defaultPeriodUntil,
		periodSince,
		periodUntil,
		setPeriodSinceParam,
		setPeriodUntilParam,
	]);

	return (
		<AlertsPublicListContext.Provider value={contextValue}>
			{children}
		</AlertsPublicListContext.Provider>
	);
};
