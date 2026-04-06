'use client';

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type ProcessingStatus, ProcessingStatusSchema, Sam, type UnixTimestamp } from '@tmlmobilidade/types';
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
		seen_first_at: null | UnixTimestamp
		seen_last_at: null | UnixTimestamp
		status: UseFilterStateListReturnType<ProcessingStatus>
		search: UseFilterStateStringReturnType
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

export function SamsListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const filterSearch = useFilterStateString('search');

	const [debouncedFilterSearch, setDebouncedFilterSearch] = useState('');

	const filterStatusOptions = useMemo(() => {
		return ProcessingStatusSchema.options.map(status => ({
			checked: false,
			disabled: false,
			label: status,
			value: status,
		}));
	}, []);
	const filterStatus = useFilterStateList<ProcessingStatus>(
		'system_status',
		ProcessingStatusSchema.options,
		filterStatusOptions,
	);

	const [filterSeenFirstAt, setFilterSeenFirstAt] = useQueryState<number>(
		'seen_first_at',
		parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp, [])),
	);
	const [filterSeenLastAt, setFilterSeenLastAt] = useQueryState<number>(
		'seen_last_at',
		parseAsInteger.withDefault(useMemo(() => Dates.now('Europe/Lisbon').plus({ minutes: 5 }).unix_timestamp, [])),
	);

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
		if (filterStatus.isActive && filterStatus.value.length)
			params.set('system_status', filterStatus.value.join(','));
		if (filterSeenFirstAt)
			params.set('seen_first_at', filterSeenFirstAt.toString());
		if (filterSeenLastAt)
			params.set('seen_last_at', filterSeenLastAt.toString());
		return params.toString();
	}, [debouncedFilterSearch, filterAgency.isActive, filterAgency.value, filterStatus.isActive, filterStatus.value, filterSeenFirstAt, filterSeenLastAt]);

	const samsListUrl = useMemo(() => {
		if (agenciesContext.flags.loading)
			return null;
		const base = API_ROUTES.controller.SAMS_LIST;
		return samsListQueryString ? `${base}?${samsListQueryString}` : base;
	}, [agenciesContext.flags.loading, samsListQueryString]);

	const { data: allSamsData, error: allSamsError, isLoading: allSamsLoading } = useSWR<Sam[], Error>(samsListUrl, { refreshInterval: 5000 });

	//
	// D. Define context value

	const contextValue: SamsListContextState = useMemo(() => ({
		actions: {
			setFilterSeenFirstAt: value => setFilterSeenFirstAt(value as number | null),
			setFilterSeenLastAt: value => setFilterSeenLastAt(value as number | null),
		},
		data: {
			filtered: allSamsData ?? [],
			raw: allSamsData ?? [],
		},
		filters: {
			agency: filterAgency,
			seen_first_at: (filterSeenFirstAt ?? null) as null | UnixTimestamp,
			seen_last_at: (filterSeenLastAt ?? null) as null | UnixTimestamp,
			status: filterStatus,
			search: filterSearch,
		},
		flags: {
			error: allSamsError,
			loading: allSamsLoading,
		},
	}), [allSamsError, allSamsLoading, filterSearch, allSamsData, filterAgency, filterStatus, filterSeenFirstAt, filterSeenLastAt, setFilterSeenFirstAt, setFilterSeenLastAt]);

	//
	// E. Render components

	return (
		<SamsListContext.Provider value={contextValue}>
			{children}
		</SamsListContext.Provider>
	);
}
