'use client';

/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { type AlertNormalized } from '@/types/normalized';
import { type Alert, AlertSchema } from '@go/types';
import { swrFetcher } from '@go/utils';
import { normalizeString } from '@go/strings';
import { useSearch } from '@go/ui';
import { usePathname } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface RealtimeListContextState {
	actions: {
		setFilterCause: (values: string[]) => void
		setFilterEffect: (values: string[]) => void
		setFilterMunicipality: (values: string[]) => void
		setFilterPublishStatus: (values: string[]) => void
		setFilterSearch: (values: string) => void
	}
	data: {
		filtered: Alert[]
		raw: Alert[]
		selectedId: string | undefined
	}
	filters: {
		cause: string[]
		effect: string[]
		municipality: string[]
		publish_status: string[]
		search: string
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const RealtimeListContext = createContext<RealtimeListContextState | undefined>(undefined);

export const useRealtimeListContext = () => {
	const context = useContext(RealtimeListContext);
	if (!context) {
		throw new Error('useRealtimeListContext must be used within an RealtimeListContextProvider');
	}
	return context;
};

/* * */

export const RealtimeListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const pathname = usePathname();

	const [filterPublishStatus, setFilterPublishStatus] = useState<string[]>(AlertSchema.shape.publish_status.options);
	const [filterCause, setFilterCause] = useState<string[]>(AlertSchema.shape.cause.options);
	const [filterEffect, setFilterEffect] = useState<string[]>(AlertSchema.shape.effect.options);
	const [filterMunicipality, setFilterMunicipality] = useState<string[]>(locationsContext.data.municipality_ids);

	const [querySearch, setQuerySearch] = useQueryState('search', { defaultValue: '' });
	const [queryPublishStatus, setQueryPublishStatus] = useQueryState<string[]>('publish_status', parseAsArrayOfStrings.withDefault([]));
	const [queryCause, setQueryCause] = useQueryState<string[]>('cause', parseAsArrayOfStrings.withDefault([]));
	const [queryEffect, setQueryEffect] = useQueryState<string[]>('effect', parseAsArrayOfStrings.withDefault([]));
	const [queryMunicipality, setQueryMunicipality] = useQueryState<string[]>('municipality', parseAsArrayOfStrings.withDefault([]));

	const selectedId = useMemo(() => {
		const alertId = pathname.split('/realtime/').pop()?.split('?').shift();
		if (!alertId) return undefined;
		return decodeURIComponent(alertId);
	}, [pathname]);

	//
	// B. Fetch data

	const { data: allAlertsData, error: allAlertsError, isLoading: allAlertsLoading } = useSWR<Alert[], Error>('/api/alerts?realtime=true', swrFetcher);

	//
	// C. Transform data

	useEffect(() => {
		setFilterCause(queryCause.length === 0 ? AlertSchema.shape.cause.options : queryCause);
		setFilterEffect(queryEffect.length === 0 ? AlertSchema.shape.effect.options : queryEffect);
		setFilterMunicipality(queryMunicipality.length === 0 ? locationsContext.data.municipality_ids : queryMunicipality);
		setFilterPublishStatus(queryPublishStatus.length === 0 ? AlertSchema.shape.publish_status.options : queryPublishStatus);
	}, [queryCause, queryEffect, queryMunicipality, queryPublishStatus]);

	const normalizedAlertsData: AlertNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allAlertsData) return [];
		// Normalize record fields
		return allAlertsData.map(item => ({
			...item,
			description_normalized: normalizeString(item.description),
			title_normalized: normalizeString(item.title),
		}));
	}, [allAlertsData]);

	const searchResultsData = useSearch<AlertNormalized>({
		accessors: ['title_normalized', 'description_normalized'],
		data: normalizedAlertsData,
		query: querySearch,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];

		// Skip if no query filters are set
		if (queryPublishStatus.length === 0 && queryCause.length === 0 && queryEffect.length === 0 && queryMunicipality.length === 0) return searchResultsData;

		// 1. Convert filter arrays to sets for O(1) membership checks
		const filterPublishStatusSet = new Set(filterPublishStatus);
		const filterCauseSet = new Set(filterCause);
		const filterEffectSet = new Set(filterEffect);
		const filterMunicipalitySet = new Set(filterMunicipality);

		// 2. Filter by query filters

		return searchResultsData.filter((alert: AlertNormalized) => {
			// Filter by publish_status
			if (!filterPublishStatusSet.has(alert.publish_status)) return false;
			// Filter by cause
			if (!filterCauseSet.has(alert.cause)) return false;
			// Filter by effect
			if (!filterEffectSet.has(alert.effect)) return false;
			// Filter by municipality
			if (filterMunicipality.length > 0 && !alert.municipality_ids.some((mId: string) => filterMunicipalitySet.has(mId))) return false;
			// Return true if all filters pass
			return true;
		});
	}, [searchResultsData, filterPublishStatus, filterCause, filterEffect, filterMunicipality, queryPublishStatus, queryCause, queryEffect, queryMunicipality]);

	//
	// D. Handle events

	const handleSetFilterCause = (values: string[]) => {
		setQueryCause(values.length === AlertSchema.shape.cause.options.length ? [] : values);
		setFilterCause(values);
	};

	const handleSetFilterEffect = (values: string[]) => {
		setQueryEffect(values.length === AlertSchema.shape.effect.options.length ? [] : values);
		setFilterEffect(values);
	};

	const handleSetFilterMunicipality = (values: string[]) => {
		setQueryMunicipality(values.length === locationsContext.data.municipality_ids.length ? [] : values);
		setFilterMunicipality(values);
	};

	const handleSetFilterPublishStatus = (values: string[]) => {
		setQueryPublishStatus(values.length === AlertSchema.shape.publish_status.options.length ? [] : values);
		setFilterPublishStatus(values);
	};

	//
	// E. Define context value

	const contextValue: RealtimeListContextState = useMemo(() => ({
		actions: {
			setFilterCause: handleSetFilterCause,
			setFilterEffect: handleSetFilterEffect,
			setFilterMunicipality: handleSetFilterMunicipality,
			setFilterPublishStatus: handleSetFilterPublishStatus,
			setFilterSearch: setQuerySearch,
		},
		data: {
			filtered: filterResultsData,
			raw: allAlertsData,
			selectedId,
		},
		filters: {
			cause: filterCause,
			effect: filterEffect,
			municipality: filterMunicipality,
			publish_status: filterPublishStatus,
			search: querySearch,
		},
		flags: {
			error: allAlertsError,
			loading: allAlertsLoading,
		},
	}), [
		allAlertsData,
		filterResultsData,
		allAlertsLoading,
		allAlertsError,
		filterPublishStatus,
		filterCause,
		filterEffect,
		filterMunicipality,
		querySearch,
		selectedId,
	]);

	//
	// E. Render components

	return (
		<RealtimeListContext.Provider value={contextValue}>
			{children}
		</RealtimeListContext.Provider>
	);

	//
};
