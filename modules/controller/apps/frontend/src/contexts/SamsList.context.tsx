/* eslint-disable import/no-extraneous-dependencies */
'use client';

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Sam, type SystemStatus, SystemStatusSchema, type UnixTimestamp } from '@tmlmobilidade/types';
import { useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType } from '@tmlmobilidade/ui';
import { parseAsInteger, useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export interface SamsListContextState {
	actions: {
		setFilterSeenFirstAt: (value: null | UnixTimestamp) => void
		setFilterSeenLastAt: (value: null | UnixTimestamp) => void
	}
	data: {
		filtered: Sam[]
		raw: Sam[]
	}
	filters: {
		agency: UseFilterStateListReturnType
		apex_version: UseFilterStateListReturnType<string>
		search: UseFilterStateStringReturnType
		seen_first_at: null | UnixTimestamp
		seen_last_at: null | UnixTimestamp
		status: UseFilterStateListReturnType<SystemStatus>
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

export const SamsListContext = createContext<SamsListContextState | undefined>(undefined);

export const useSamsListContext = () => {
	const context = useContext(SamsListContext);
	if (!context) {
		throw new Error('useSamsListContext must be used within a SamsListContextProvider');
	}
	return context;
};

const getSamSystemStatus = (sam: Sam): SystemStatus => {
	const analyses = sam.analysis ?? [];
	if (!analyses.length) return 'error';

	const isNullish = (value: unknown) => value === null || value === undefined;

	const allAnalysesAreFullyNull = analyses.every(analysis =>
		Object.values(analysis).every(isNullish),
	);
	if (allAnalysesAreFullyNull) return 'error';

	const hasAnyNullFieldInAnyAnalysis = analyses.some(analysis =>
		Object.values(analysis).some(isNullish),
	);
	if (hasAnyNullFieldInAnyAnalysis) return 'incomplete';

	return 'complete';
};

const SAMS_PAGE_SIZE = 500;

// --- Custom Hook splits out logic for clean separation
export function SamsListContextProvider({ children }: PropsWithChildren) {
	// A. Setup variables
	const filterSearch = useFilterStateString('search');
	const [debouncedFilterSearch, setDebouncedFilterSearch] = useState('');

	const filterStatusOptions = useMemo(() => {
		return SystemStatusSchema.options.map(status => ({
			checked: false,
			disabled: false,
			label: status,
			value: status,
		}));
	}, []);
	const filterStatus = useFilterStateList<SystemStatus>(
		'system_status',
		SystemStatusSchema.options,
		filterStatusOptions,
	);

	const [filterSeenFirstAt, setFilterSeenFirstAt] = useQueryState<number>('seen_first_at', parseAsInteger);
	const [filterSeenLastAt, setFilterSeenLastAt] = useQueryState<number>('seen_last_at', parseAsInteger);
	const [filterPage, setFilterPage] = useQueryState<number>('page', parseAsInteger);

	const normalizeApexVersion = useCallback(
		(value: null | string | undefined): null | string => {
			if (value == null) return null;
			const trimmed = value.trim();
			if (!trimmed) return null;
			return trimmed;
		},
		[],
	);

	useEffect(() => {
		const handle = window.setTimeout(() => {
			setDebouncedFilterSearch(filterSearch.value.trim());
		}, 100);
		return () => window.clearTimeout(handle);
	}, [filterSearch.value]);

	// B. Agencies (all operators for defaults / options; URL omits `agency_id` when all are selected)
	const agenciesContext = useAgenciesContext();
	const agencyIdsOrdered = agenciesContext.data.ids;

	const agencyOptions = useMemo(
		() =>
			agenciesContext.data.raw.map(item => ({
				checked: false,
				disabled: false,
				label: `${item._id} - ${item.name}`,
				value: item._id,
			})),
		[agenciesContext.data.raw],
	);

	const filterAgency = useFilterStateList('agency_id', agencyIdsOrdered, agencyOptions);

	const baseQueryString = useMemo(() => {
		const params = new URLSearchParams();
		if (filterAgency.isActive && filterAgency.value.length)
			params.set('agency_ids', filterAgency.value.join(','));
		if (debouncedFilterSearch) params.set('search', debouncedFilterSearch);
		if (filterSeenFirstAt) params.set('seen_first_at', filterSeenFirstAt.toString());
		if (filterSeenLastAt) params.set('seen_last_at', filterSeenLastAt.toString());
		return params.toString();
	}, [debouncedFilterSearch, filterAgency.isActive, filterAgency.value, filterSeenFirstAt, filterSeenLastAt]);

	const apexVersionsUrl = useMemo(() => {
		if (agenciesContext.flags.loading) return null;
		const base = `${API_ROUTES.controller.SAMS_LIST}/apex-versions`;
		return baseQueryString ? `${base}?${baseQueryString}` : base;
	}, [agenciesContext.flags.loading, baseQueryString]);

	const { data: apexVersionsData } = useSWR<string[], Error>(apexVersionsUrl);

	const apexVersionOptions = useMemo(
		() =>
			[
				...new Set(
					(apexVersionsData ?? [])
						.map(value => normalizeApexVersion(value))
						.filter((value): value is string => value != null),
				),
			].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })),
		[apexVersionsData, normalizeApexVersion],
	);

	const filterApexVersion = useFilterStateList<string>(
		'latest_apex_version',
		apexVersionOptions,
		apexVersionOptions.map(item => ({ label: item, value: item })),
	);

	const normalizedFilterApexVersionValues = useMemo(
		() =>
			[
				...new Set(
					filterApexVersion.value
						.map(item => normalizeApexVersion(item))
						.filter((item): item is string => item != null),
				),
			],
		[filterApexVersion.value, normalizeApexVersion],
	);

	const effectiveApexVersionFilterValues = useMemo(() => {
		if (apexVersionOptions.length === 0) return [];
		const available = new Set(apexVersionOptions);
		const selectedAvailable = normalizedFilterApexVersionValues.filter(value => available.has(value));
		if (selectedAvailable.length === 0) return [];
		// If all available options are selected, do not restrict or write URL filter.
		if (selectedAvailable.length === apexVersionOptions.length) return [];
		return selectedAvailable;
	}, [apexVersionOptions, normalizedFilterApexVersionValues]);

	const samsListQueryString = useMemo(() => {
		const params = new URLSearchParams(baseQueryString);
		if (effectiveApexVersionFilterValues.length)
			params.set('latest_apex_version', effectiveApexVersionFilterValues.join(','));
		const page = Math.max(1, filterPage ?? 1);
		params.set('limit', SAMS_PAGE_SIZE.toString());
		params.set('offset', ((page - 1) * SAMS_PAGE_SIZE).toString());
		return params.toString();
	}, [baseQueryString, effectiveApexVersionFilterValues, filterPage]);

	const samsListUrl = useMemo(() => {
		if (agenciesContext.flags.loading) return null;
		const base = API_ROUTES.controller.SAMS_LIST;
		return samsListQueryString ? `${base}?${samsListQueryString}` : base;
	}, [agenciesContext.flags.loading, samsListQueryString]);

	useEffect(() => {
		if ((filterPage ?? 1) <= 1) return;
		void setFilterPage(1);
	}, [baseQueryString, effectiveApexVersionFilterValues, filterPage, setFilterPage]);

	const { data: allSamsData = [], error: allSamsError, isLoading: allSamsLoading } = useSWR<Sam[], Error>(samsListUrl);

	const normalizedSamsData = useMemo(() => {
		return allSamsData.map(item => ({ ...item, latest_apex_version: normalizeApexVersion(item.latest_apex_version) }));
	}, [allSamsData, normalizeApexVersion]);

	const samsDataWithComputedStatus = useMemo(() => {
		return normalizedSamsData.map(item => ({ ...item, system_status: getSamSystemStatus(item) }));
	}, [normalizedSamsData]);

	const filteredSamsData = useMemo(() => {
		if (!filterStatus.isActive || !filterStatus.value.length)
			return samsDataWithComputedStatus;
		return samsDataWithComputedStatus.filter(item =>
			filterStatus.value.includes(item.system_status),
		);
	}, [filterStatus.isActive, filterStatus.value, samsDataWithComputedStatus]);

	// D. Define context value
	const contextValue: SamsListContextState = useMemo(
		() => ({
			actions: {
				setFilterSeenFirstAt: value => setFilterSeenFirstAt(value as null | number),
				setFilterSeenLastAt: value => setFilterSeenLastAt(value as null | number),
			},
			data: {
				filtered: filteredSamsData,
				raw: samsDataWithComputedStatus,
			},
			filters: {
				agency: filterAgency,
				apex_version: filterApexVersion,
				search: filterSearch,
				seen_first_at: (filterSeenFirstAt ?? null) as null | UnixTimestamp,
				seen_last_at: (filterSeenLastAt ?? null) as null | UnixTimestamp,
				status: filterStatus,
			},
			flags: {
				error: allSamsError,
				loading: allSamsLoading,
			},
		}),
		[
			allSamsError,
			allSamsLoading,
			filterSearch,
			filterAgency,
			filterApexVersion,
			filterStatus,
			filterSeenFirstAt,
			filterSeenLastAt,
			filteredSamsData,
			samsDataWithComputedStatus,
			setFilterSeenFirstAt,
			setFilterSeenLastAt,
		],
	);

	//

	//
	// E. Render components
	return (
		<SamsListContext.Provider value={contextValue}>
			{children}
		</SamsListContext.Provider>
	);
}

