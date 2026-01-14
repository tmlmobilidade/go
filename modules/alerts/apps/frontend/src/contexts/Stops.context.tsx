'use client';

/* * */

import type { Stop } from '@carrismetropolitana/api-types/network';

import { SelectDataItem } from '@tmlmobilidade/ui';
import { standardSwrFetcher } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

const CMET_API = process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2';

interface StopsContextState {
	actions: {
		getStopById: (stopId: string) => Stop | undefined
	}
	data: {
		options: SelectDataItem[]
		stops: Stop[]
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const StopsContext = createContext<StopsContextState | undefined>(undefined);

export function useStopsContext() {
	const context = useContext(StopsContext);
	if (!context) {
		throw new Error('useStopsContext must be used within a StopsContextProvider');
	}
	return context;
}

/* * */

export const StopsContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Fetch data

	const { data: allStopsData, isLoading: allStopsLoading } = useSWR<Stop[], Error>(`${CMET_API}/stops`, standardSwrFetcher);

	//
	// B. Handle actions

	const getStopById = (stopId: string): Stop | undefined => {
		return allStopsData?.find(stop => stop.id === stopId);
	};

	//
	// C. Define context value

	const asOptions = useMemo(() => {
		if (!allStopsData) return [];
		return allStopsData.map(stop => ({
			label: `${stop.id} | ${stop.long_name}`,
			value: stop.id,
		}));
	}, [allStopsData]);

	//
	// C. Define context value

	const contextValue: StopsContextState = {
		actions: {
			getStopById,
		},
		data: {
			options: asOptions,
			stops: allStopsData || [],
		},
		flags: {
			is_loading: allStopsLoading,
		},
	};

	//
	// D. Render components

	return (
		<StopsContext.Provider value={contextValue}>
			{children}
		</StopsContext.Provider>
	);

	//
};

/* * */

export function transformStopDataIntoGeoJsonFeature(stopData: Stop): GeoJSON.Feature<GeoJSON.Point> {
	return {
		geometry: {
			coordinates: [stopData.lon, stopData.lat],
			type: 'Point',
		},
		properties: {
			current_status: stopData.operational_status,
			id: stopData.id,
			lat: stopData.lat,
			lon: stopData.lon,
			long_name: stopData.long_name,
		},
		type: 'Feature',
	};
}
