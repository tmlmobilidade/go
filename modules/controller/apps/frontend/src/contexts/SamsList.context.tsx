'use client';

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ProcessingStatus, ProcessingStatusSchema, Sam } from '@tmlmobilidade/types';
import { useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType } from '@tmlmobilidade/ui';

/* * */

import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export interface SamsListContextState {
	data: {
		filtered: Sam[]
		raw: Sam[]
	}
	filters: {
		agency: UseFilterStateListReturnType
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
		const labelsByValue: Record<ProcessingStatus, string> = {
			complete: 'Completo',
			error: 'Erro',
			processing: 'Em processamento',
			skipped: 'Ignorado',
			waiting: 'Aguardando',
		};
		return ProcessingStatusSchema.options.map(status => ({
			checked: false,
			disabled: false,
			label: labelsByValue[status],
			value: status,
		}));
	}, []);
	const filterStatus = useFilterStateList<ProcessingStatus>(
		'system_status',
		ProcessingStatusSchema.options,
		filterStatusOptions,
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
		return params.toString();
	}, [debouncedFilterSearch, filterAgency.isActive, filterAgency.value, filterStatus.isActive, filterStatus.value]);

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
		data: {
			filtered: allSamsData ?? [],
			raw: allSamsData ?? [],
		},
		filters: {
			agency: filterAgency,
			status: filterStatus,
			search: filterSearch,
		},
		flags: {
			error: allSamsError,
			loading: allSamsLoading,
		},
	}), [allSamsError, allSamsLoading, filterSearch, allSamsData, filterAgency, filterStatus]);

	//
	// E. Render components

	return (
		<SamsListContext.Provider value={contextValue}>
			{children}
		</SamsListContext.Provider>
	);
}
