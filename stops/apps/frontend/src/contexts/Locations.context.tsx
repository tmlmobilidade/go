'use client';

import { Routes } from '@/lib/routes';
import { unauthenticatedFetcher } from '@/utils/http';
import { createContext, useContext, useMemo } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

interface LocationsContextState {
	actions: {
		handleDBSync: () => void
	}
	data: {
		localities: unknown[]
		municipalities: unknown[]
		parishes: unknown[]
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const LocationsContext = createContext<LocationsContextState | undefined>(undefined);

export function useLocationsContext() {
	const context = useContext(LocationsContext);
	if (!context) {
		throw new Error('useLocationsContext must be used within a LocationsContextProvider');
	}
	return context;
}

/* * */

export const LocationsContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Fetch data

	const { data: localitiesData, isLoading: locationsLoading } = useSWR<unknown[], Error>(`${Routes.LOCATIONS_API}/localities`, unauthenticatedFetcher);
	const { data: municipalitiesData, isLoading: municipalitiesLoading } = useSWR<unknown[], Error>(`${Routes.LOCATIONS_API}/municipalities`, unauthenticatedFetcher);
	const { data: parishesData, isLoading: parishesLoading } = useSWR<unknown[], Error>(`${Routes.LOCATIONS_API}/parishes`, unauthenticatedFetcher);

	//
	// B. Handle actions

	const handleDBSync = () => {
		mutate(`${Routes.LOCATIONS_API}/localities`);
		mutate(`${Routes.LOCATIONS_API}/municipalities`);
		mutate(`${Routes.LOCATIONS_API}/parishes`);
	};

	// const getLineDataById = (lineId: string) => {
	// 	return allLinesData?.find(line => line.id === lineId);
	// };

	// const getDemandMetricsByLineId = (lineId: string) => {
	// 	return demandByLineData?.find(demandMetrics => demandMetrics.line_id === lineId);
	// };

	// const getServiceMetricsByLineId = (lineId: string) => {
	// 	return serviceMetricsData?.data.filter(serviceMetrics => serviceMetrics.line_id === lineId);
	// };

	//
	// C. Define context value

	const contextValue: LocationsContextState = useMemo(() => ({
		actions: {
			handleDBSync,
		},
		data: {
			localities: localitiesData || [],
			municipalities: municipalitiesData || [],
			parishes: parishesData || [],
		},
		flags: {
			is_loading: locationsLoading || municipalitiesLoading || parishesLoading,
		},
	}), [
		localitiesData,
		municipalitiesData,
		parishesData,
		locationsLoading,
		municipalitiesLoading,
		parishesLoading,
	]);

	//
	// D. Render components

	return (
		<LocationsContext.Provider value={contextValue}>
			{children}
		</LocationsContext.Provider>
	);

	//
};
