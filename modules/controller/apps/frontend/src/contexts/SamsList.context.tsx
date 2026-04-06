'use client';

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { ApexVersion, ApexVersionSchema, Sam, type SystemStatus, SystemStatusSchema, type UnixTimestamp } from '@tmlmobilidade/types';
import { useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType } from '@tmlmobilidade/ui';
import { parseAsInteger, useQueryState } from 'nuqs';

/* * */

import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
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
		apex_version: UseFilterStateListReturnType<ApexVersion>
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
	if (!analyses.length)
		return 'error';

	const isNullish = (value: unknown) => value === null || value === undefined;

	const allAnalysesAreFullyNull = analyses.every(analysis => Object.values(analysis).every(isNullish));
	if (allAnalysesAreFullyNull)
		return 'error';

	const hasAnyNullFieldInAnyAnalysis = analyses.some(analysis => Object.values(analysis).some(isNullish));
	if (hasAnyNullFieldInAnyAnalysis)
		return 'incomplete';

	return 'complete';
};

export function SamsListContextProvider({ children }: PropsWithChildren) {
	//

	//
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

	const [filterSeenFirstAt, setFilterSeenFirstAt] = useQueryState<number>(
		'seen_first_at',
		parseAsInteger,
	);
	const [filterSeenLastAt, setFilterSeenLastAt] = useQueryState<number>(
		'seen_last_at',
		parseAsInteger,
	);

	const filterApexVersion = useFilterStateList<ApexVersion>('latest_apex_version', ApexVersionSchema.options, ApexVersionSchema.options.map(item => ({ label: item, value: item })));

	useEffect(() => {
		const handle = window.setTimeout(() => {
			setDebouncedFilterSearch(filterSearch.value.trim());
		}, 500);
		return () => window.clearTimeout(handle);
	}, [filterSearch.value]);

	//
	// B. Agencies (all operators for defaults / options; URL omits `agency_id` when all are selected)

	const agenciesContext = useAgenciesContext();

	const agencyIdsOrdered = agenciesContext.data.ids;

	const agencyOptions = useMemo(() => agenciesContext.data.raw.map(item => ({
		checked: false,
		disabled: false,
		label: `${item._id} - ${item.name}`,
		value: item._id,
	})),
	[agenciesContext.data.raw],
	);

	const filterAgency = useFilterStateList('agency_id', agencyIdsOrdered, agencyOptions);

	const samsListQueryString = useMemo(() => {
		const params = new URLSearchParams();
		if (filterAgency.isActive && filterAgency.value.length)
			params.set('agency_ids', filterAgency.value.join(','));
		if (debouncedFilterSearch)
			params.set('search', debouncedFilterSearch);
		if (filterSeenFirstAt)
			params.set('seen_first_at', filterSeenFirstAt.toString());
		if (filterSeenLastAt)
			params.set('seen_last_at', filterSeenLastAt.toString());
		if (filterApexVersion.isActive && filterApexVersion.value.length)
			params.set('latest_apex_version', filterApexVersion.value.join(','));
		return params.toString();
	}, [debouncedFilterSearch, filterAgency.isActive, filterAgency.value, filterSeenFirstAt, filterSeenLastAt, filterApexVersion.isActive, filterApexVersion.value]);

	const samsListUrl = useMemo(() => {
		if (agenciesContext.flags.loading)
			return null;
		const base = API_ROUTES.controller.SAMS_LIST;
		return samsListQueryString ? `${base}?${samsListQueryString}` : base;
	}, [agenciesContext.flags.loading, samsListQueryString]);

	const { data: allSamsData, error: allSamsError, isLoading: allSamsLoading } = useSWR<Sam[], Error>(samsListUrl, { refreshInterval: 5000 });
	const samsDataWithComputedStatus = useMemo(() => {
		return (allSamsData ?? []).map(item => ({ ...item, system_status: getSamSystemStatus(item) }));
	}, [allSamsData]);
	const filteredSamsData = useMemo(() => {
		if (!filterStatus.isActive || !filterStatus.value.length)
			return samsDataWithComputedStatus;
		return samsDataWithComputedStatus.filter(item => filterStatus.value.includes(item.system_status));
	}, [filterStatus.isActive, filterStatus.value, samsDataWithComputedStatus]);

	//
	// D. Define context value

	const contextValue: SamsListContextState = useMemo(() => ({
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
	}), [allSamsError, allSamsLoading, filterSearch, filterAgency, filterApexVersion, filterStatus, filterSeenFirstAt, filterSeenLastAt, filteredSamsData, samsDataWithComputedStatus, setFilterSeenFirstAt, setFilterSeenLastAt]);

	//
	// E. Render components

	return (
		<SamsListContext.Provider value={contextValue}>
			{children}
		</SamsListContext.Provider>
	);
}
